import { supabase } from './supabaseClient';

// Active localities, alphabetical — used to populate the search dropdown.
export async function getLocalities() {
  const { data, error } = await supabase
    .from('localities')
    .select('id, name, mandal')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data;
}

// Live listings filtered by locality/type/purpose/price — used by
// /listings. Locality/type/purpose each accept a single value OR an array
// (multi-select checkboxes); anything left out/empty is simply not
// applied. Price range only ever filters the `price` column (sale/lease
// listings) — rent_amount isn't included, to keep this simple for now.
export async function searchListings({
  locality,
  type,
  purpose,
  minPrice,
  maxPrice,
  keyword,
  sort,
  page = 1,
  pageSize = 12,
} = {}) {
  let query = supabase
    .from('listings')
    .select(
      `id, title, type, purpose, price, price_on_request, rent_amount,
       area_value, area_unit, bedrooms, latitude, longitude,
       locality:localities(id, name, mandal),
       cover_image:listing_images(r2_url, is_cover)`,
      { count: 'exact' }
    )
    .eq('status', 'live');

  const asArray = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);

  const localities = asArray(locality);
  const types = asArray(type);
  const purposes = asArray(purpose);

  if (localities.length === 1) query = query.eq('locality_id', localities[0]);
  else if (localities.length > 1) query = query.in('locality_id', localities);

  if (types.length === 1) query = query.eq('type', types[0]);
  else if (types.length > 1) query = query.in('type', types);

  if (purposes.length === 1) query = query.eq('purpose', purposes[0]);
  else if (purposes.length > 1) query = query.in('purpose', purposes);

  if (minPrice) query = query.gte('price', Number(minPrice));
  if (maxPrice) query = query.lte('price', Number(maxPrice));

  // Keyword search across title and description (case-insensitive,
  // partial match on either field).
  if (keyword && keyword.trim()) {
    const term = keyword.trim().replace(/[%_]/g, '\\$&');
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  // Sort — defaults to newest first.
  if (sort === 'price_asc') query = query.order('price', { ascending: true, nullsFirst: false });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false, nullsFirst: false });
  else query = query.order('created_at', { ascending: false });

  // Pagination.
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { listings: data, totalCount: count ?? 0 };
}

// Most recent live listings for the homepage. Only 'live' rows are ever
// returned to anonymous visitors — this isn't just a filter here, it's
// enforced at the database level by RLS regardless of what this query asks for.
export async function getFeaturedListings(limit = 6) {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `id, title, type, purpose, price, price_on_request, area_value, area_unit,
       bedrooms, locality:localities(name, mandal),
       cover_image:listing_images(r2_url, is_cover)`
    )
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Active amenities — used to populate the checkboxes on the listing form.
export async function getAmenities() {
  const { data, error } = await supabase
    .from('amenities')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data;
}

// Creates a new listing owned by the currently logged-in user, and links
// any selected amenities. Always submitted as 'pending_approval' — nobody
// can post directly to 'live'; that's enforced both here and by the
// database trigger regardless of what gets sent.
export async function createListing(listingFields, amenityIds = []) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('You must be logged in to create a listing.');

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      ...listingFields,
      owner_id: user.id,
      status: 'pending_approval',
    })
    .select()
    .single();

  if (listingError) throw listingError;

  if (amenityIds.length > 0) {
    const rows = amenityIds.map((amenity_id) => ({
      listing_id: listing.id,
      amenity_id,
    }));
    const { error: amenitiesError } = await supabase
      .from('listing_amenities')
      .insert(rows);
    if (amenitiesError) throw amenitiesError;
  }

  return listing;
}

// Uploads each file to Supabase Storage under listings/<listingId>/..., then
// records a matching row in listing_images for each one. The first file is
// marked as the cover photo. Storage write access is gated on being logged
// in at all (see 0004_storage_setup.sql); real per-listing ownership is
// enforced here by the listing_images RLS policy when these rows insert.
export async function uploadListingPhotos(listingId, files) {
  const uploaded = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop();
    const path = `${listingId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('listing-photos')
      .upload(path, file, { upsert: false });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('listing-photos').getPublicUrl(path);

    uploaded.push({ r2_url: publicUrl, is_cover: i === 0, sort_order: i });
  }

  const { error: insertError } = await supabase
    .from('listing_images')
    .insert(uploaded.map((img) => ({ ...img, listing_id: listingId })));

  if (insertError) throw insertError;
}

// The current user's own profile row — used to check their role (e.g.
// whether they're an admin) since that isn't in the auth session itself.
export async function getMyProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

// Listings awaiting admin review. RLS only lets an admin's own query
// actually return pending rows — a non-admin calling this just gets an
// empty result, not an error, since the row-level policy silently excludes
// rows rather than rejecting the query.
export async function getPendingListings() {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `id, title, type, purpose, price, price_on_request, rent_amount,
       area_value, area_unit, created_at, locality:localities(name),
       owner:profiles!listings_owner_id_fkey(full_name)`
    )
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Approve or reject a pending listing. Only succeeds for an admin — RLS
// blocks the update entirely for anyone else, so this will throw for a
// non-admin caller rather than silently doing nothing.
export async function setListingStatus(listingId, status) {
  const { error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', listingId);

  if (error) throw error;
}

// All listings owned by the given user, any status — used on the
// dashboard so an owner can see pending/live/rejected listings alike.
export async function getMyListings(userId) {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `id, title, type, purpose, status, price, price_on_request, rent_amount,
       created_at, view_count, locality:localities(name)`
    )
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Full detail for a single listing. Returns null (not an error) if the
// listing doesn't exist, isn't live, and the viewer isn't its owner/admin —
// RLS excludes the row entirely rather than throwing a permission error.
// The owner's phone is deliberately never selected here — only name/agency
// info is shown publicly; the actual number is only exposed after a
// visitor submits the contact form below (see Section 9's privacy rule).
export async function getListingById(id) {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `id, title, description, type, purpose, price, price_on_request,
       rent_amount, deposit_amount, area_value, area_unit, bedrooms,
       bathrooms, floor_number, total_floors, property_age_years,
       facing_direction, furnishing, plot_length, plot_width, road_width_ft,
       is_approved_layout, landmark, latitude, longitude, status, created_at,
       locality_id, locality:localities(name, mandal),
       images:listing_images(r2_url, is_cover, sort_order),
       amenities:listing_amenities(amenity:amenities(name)),
       owner:profiles!listings_owner_id_fkey(full_name, agency_name, is_verified, avatar_url)`
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Submits a "Contact Owner" inquiry. Anyone can call this, logged in or
// not — RLS allows the insert unconditionally, but only the listing's
// owner and admins can ever read the resulting rows back.
export async function createInquiry({ listingId, name, phone, message }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('inquiries')
    .insert({
      listing_id: listingId,
      sender_id: user?.id ?? null,
      sender_name: name,
      sender_phone: phone,
      message: message || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Admin: localities & amenities management ---
// These return ALL rows (active and inactive) when called by an admin —
// RLS ("localities_select_active_or_admin" / "amenities_select_active_or_admin")
// automatically restricts a non-admin caller to active rows only, so no
// extra filtering is needed here.

export async function adminGetLocalities() {
  const { data, error } = await supabase
    .from('localities')
    .select('id, name, mandal, is_active')
    .order('name');

  if (error) throw error;
  return data;
}

export async function createLocality({ name, mandal }) {
  const { error } = await supabase
    .from('localities')
    .insert({ name, mandal: mandal || null });

  if (error) throw error;
}

export async function setLocalityActive(id, is_active) {
  const { error } = await supabase
    .from('localities')
    .update({ is_active })
    .eq('id', id);

  if (error) throw error;
}

export async function adminGetAmenities() {
  const { data, error } = await supabase
    .from('amenities')
    .select('id, name, is_active')
    .order('name');

  if (error) throw error;
  return data;
}

export async function createAmenity(name) {
  const { error } = await supabase.from('amenities').insert({ name });
  if (error) throw error;
}

export async function setAmenityActive(id, is_active) {
  const { error } = await supabase
    .from('amenities')
    .update({ is_active })
    .eq('id', id);

  if (error) throw error;
}

// --- Reports / moderation queue ---

// Any logged-in user can report a listing. RLS requires auth.uid() is not
// null for this insert — an anonymous visitor gets an error, so the UI
// should only offer this to logged-in users.
export async function createReport({ listingId, reason }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('You must be logged in to report a listing.');

  const { error } = await supabase.from('reports').insert({
    listing_id: listingId,
    reporter_id: user.id,
    reason,
  });

  if (error) throw error;
}

// Open reports, for the admin moderation queue.
export async function getOpenReports() {
  const { data, error } = await supabase
    .from('reports')
    .select(
      `id, reason, status, created_at,
       listing:listings(id, title, status),
       reporter:profiles!reports_reporter_id_fkey(full_name)`
    )
    .eq('status', 'open')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Admin resolves a report: 'reviewed' (looked at, no action needed),
// 'dismissed' (not a valid complaint), or 'actioned' (something was done
// about it, e.g. the listing was also rejected separately).
export async function setReportStatus(id, status) {
  const { error } = await supabase.from('reports').update({ status }).eq('id', id);
  if (error) throw error;
}

// --- Real stats, used on the homepage instead of placeholder numbers ---

export async function getLiveListingCount() {
  const { count, error } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'live');

  if (error) throw error;
  return count || 0;
}

// Live listing count per locality — used on the "Popular localities" cards.
// Fetched as one lightweight query and reduced client-side, which is fine
// at this scale (a handful of localities, not millions of rows).
export async function getListingCountsByLocality() {
  const { data, error } = await supabase
    .from('listings')
    .select('locality_id')
    .eq('status', 'live');

  if (error) throw error;

  const counts = {};
  for (const row of data) {
    if (row.locality_id) counts[row.locality_id] = (counts[row.locality_id] || 0) + 1;
  }
  return counts;
}

// --- Favorites ---

export async function getMyFavoriteIds() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('listing_id')
    .eq('user_id', user.id);

  if (error) throw error;
  return data.map((row) => row.listing_id);
}

export async function addFavorite(listingId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to save favorites.');

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, listing_id: listingId });

  if (error) throw error;
}

export async function removeFavorite(listingId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to remove favorites.');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listingId);

  if (error) throw error;
}

// Full listing cards for the dashboard's "My Favorites" tab.
export async function getMyFavoriteListings(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select(
      `listing:listings(id, title, type, purpose, price, price_on_request, rent_amount,
       locality:localities(name), cover_image:listing_images(r2_url, is_cover))`
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  // Each row wraps the listing under `listing` — unwrap, and drop any where
  // the listing itself is no longer visible (e.g. was rejected since saving).
  return data.map((row) => row.listing).filter(Boolean);
}

// Reveals a listing owner's phone number via the secure, logged
// SECURITY DEFINER function — this is the ONLY sanctioned way to get a
// phone number; the profiles table itself no longer allows selecting the
// phone column directly (see 0005_phone_reveal.sql).
export async function revealOwnerPhone(listingId) {
  const { data, error } = await supabase.rpc('reveal_listing_owner_phone', {
    p_listing_id: listingId,
  });

  if (error) throw error;
  return data; // the phone number, as plain text
}

// Reads the current user's own phone via a dedicated secure function —
// kept separate from getMyProfile() above, since a plain column SELECT
// of `phone` is blocked entirely at the database level (see
// 0005_phone_reveal.sql / 0007_fix_my_phone_access.sql).
export async function getMyPhone() {
  const { data, error } = await supabase.rpc('get_my_phone');
  if (error) throw error;
  return data;
}

// Updates the current user's own phone number. Column-level grants (see
// 0005_phone_reveal.sql) explicitly allow authenticated users to update
// their own phone column, alongside the existing row-level RLS policy.
export async function updateMyPhone(phone) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in.');

  const { error } = await supabase
    .from('profiles')
    .update({ phone })
    .eq('id', user.id);

  if (error) throw error;
}

// --- My Leads (owner-facing inquiries + phone-reveal interest signal) ---

// All inquiries received across every listing the current user owns,
// newest first. RLS already restricts inquiries to the listing's own
// owner (or admin), so this simply asks for "mine" via the join filter.
export async function getMyLeads(userId) {
  const { data, error } = await supabase
    .from('inquiries')
    .select(
      `id, sender_name, sender_phone, message, created_at,
       listing:listings!inner(id, title, owner_id)`
    )
    .eq('listing.owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Phone-reveal counts per listing, for the current user's own listings —
// shown as a lightweight "how much interest" signal alongside inquiries.
export async function getMyPhoneRevealCounts(userId) {
  const { data, error } = await supabase
    .from('phone_reveals')
    .select(`listing_id, listing:listings!inner(owner_id)`)
    .eq('listing.owner_id', userId);

  if (error) throw error;

  const counts = {};
  for (const row of data) {
    counts[row.listing_id] = (counts[row.listing_id] || 0) + 1;
  }
  return counts;
}

// Inquiry counts per listing, same pattern as above — used on "My
// Listings" so each row shows how many inquiries it's received.
export async function getMyInquiryCounts(userId) {
  const { data, error } = await supabase
    .from('inquiries')
    .select(`listing_id, listing:listings!inner(owner_id)`)
    .eq('listing.owner_id', userId);

  if (error) throw error;

  const counts = {};
  for (const row of data) {
    counts[row.listing_id] = (counts[row.listing_id] || 0) + 1;
  }
  return counts;
}

// --- Owner actions on their own listings: renew, mark sold/rented ---

// Resets expires_at to 60 days from now — the spec's "one-click Renew".
// RLS already permits an owner to update their own listing's expires_at.
export async function renewListing(listingId) {
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 60);

  const { error } = await supabase
    .from('listings')
    .update({ expires_at: newExpiry.toISOString(), status: 'live' })
    .eq('id', listingId);

  if (error) throw error;
}

// Owner marks their own listing as sold or rented. Reuses the same update
// path as admin status changes — RLS's guard trigger only intercepts an
// attempt to self-approve to 'live', so 'sold'/'rented' go through freely
// for the listing's own owner.
export async function markListingOutcome(listingId, status) {
  const { error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', listingId);

  if (error) throw error;
}

// --- Editing an existing listing (owner or admin) ---

// Full raw data needed to pre-fill the edit form, including which
// amenities are currently selected. RLS lets the owner select their own
// listing regardless of its status (pending/live/rejected/etc.).
export async function getListingForEdit(id) {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `*, amenities:listing_amenities(amenity_id), images:listing_images(r2_url, is_cover, sort_order)`
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Updates a listing's fields. A non-admin editing a listing that's
// currently live will have it quietly dropped back to pending_approval by
// the existing database trigger (guard_listing_status_transition only
// intercepts a direct jump TO 'live', so editing fields on an
// already-live listing doesn't retrigger review — only an explicit status
// change to 'live' would).
export async function updateListing(id, fields) {
  const { error } = await supabase.from('listings').update(fields).eq('id', id);
  if (error) throw error;
}

// Full-replace a listing's amenity selections — simplest correct approach
// for an edit form (clear old links, insert the new set).
export async function updateListingAmenities(id, amenityIds) {
  const { error: deleteError } = await supabase
    .from('listing_amenities')
    .delete()
    .eq('listing_id', id);
  if (deleteError) throw deleteError;

  if (amenityIds.length > 0) {
    const { error: insertError } = await supabase
      .from('listing_amenities')
      .insert(amenityIds.map((amenity_id) => ({ listing_id: id, amenity_id })));
    if (insertError) throw insertError;
  }
}

// --- Admin: user management ---
// Note: email isn't available here — it lives in Supabase's private auth
// system, not the `profiles` table, and reading it requires the
// service-role key (server-side only, same pattern as the notify API
// route). This lists what's available client-side: name, role, verified
// status, agency, and phone is intentionally excluded (column-restricted,
// same as everywhere else in this app).

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_verified, agency_name, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function setUserVerified(userId, isVerified) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_verified: isVerified })
    .eq('id', userId);

  if (error) throw error;
}

export async function setUserRole(userId, role) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

// Checks whether a phone number is already registered — used by the
// signup form BEFORE attempting to create an account, so a duplicate
// phone shows a clear message immediately instead of silently failing
// deep inside a database trigger. Reveals only true/false, never any
// actual phone data.
export async function checkPhoneExists(phone) {
  const { data, error } = await supabase.rpc('check_phone_exists', { p_phone: phone });
  if (error) throw error;
  return data;
}

// A handful of other live listings similar to the given one — same
// locality first, falling back to same type/purpose if the locality
// doesn't have enough. Excludes the listing itself.
export async function getSimilarListings(listing, limitCount = 4) {
  let query = supabase
    .from('listings')
    .select(
      `id, title, type, purpose, price, price_on_request, rent_amount,
       area_value, area_unit, bedrooms,
       locality:localities(id, name, mandal),
       cover_image:listing_images(r2_url, is_cover)`
    )
    .eq('status', 'live')
    .neq('id', listing.id)
    .limit(limitCount);

  if (listing.locality_id) {
    query = query.eq('locality_id', listing.locality_id);
  } else {
    query = query.eq('type', listing.type);
  }

  const { data, error } = await query;
  if (error) throw error;

  // If the locality match came up short, top up with same-type listings.
  if (data.length < limitCount && listing.locality_id) {
    const { data: more, error: moreError } = await supabase
      .from('listings')
      .select(
        `id, title, type, purpose, price, price_on_request, rent_amount,
         area_value, area_unit, bedrooms,
         locality:localities(id, name, mandal),
         cover_image:listing_images(r2_url, is_cover)`
      )
      .eq('status', 'live')
      .eq('type', listing.type)
      .neq('id', listing.id)
      .not('id', 'in', `(${data.map((d) => d.id).join(',') || '00000000-0000-0000-0000-000000000000'})`)
      .limit(limitCount - data.length);

    if (!moreError && more) return [...data, ...more];
  }

  return data;
}

// Fire-and-forget-style view counter — called once per listing detail
// page load. Uses a SECURITY DEFINER function so anonymous visitors can
// increment it without a broader UPDATE grant on listings.
export async function incrementViewCount(listingId) {
  const { error } = await supabase.rpc('increment_view_count', { p_listing_id: listingId });
  if (error) console.error('Failed to record view:', error);
}
