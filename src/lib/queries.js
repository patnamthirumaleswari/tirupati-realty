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

// Live listings filtered by locality/type/purpose — used by /listings.
// Any filter left out (undefined/empty string) is simply not applied.
export async function searchListings({ locality, type, purpose } = {}) {
  let query = supabase
    .from('listings')
    .select(
      `id, title, type, purpose, price, price_on_request, rent_amount,
       area_value, area_unit, bedrooms, locality:localities(id, name, mandal),
       cover_image:listing_images(r2_url, is_cover)`
    )
    .eq('status', 'live')
    .order('created_at', { ascending: false });

  if (locality) query = query.eq('locality_id', locality);
  if (type) query = query.eq('type', type);
  if (purpose) query = query.eq('purpose', purpose);

  const { data, error } = await query;
  if (error) throw error;
  return data;
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
       owner:profiles!listings_owner_id_fkey(full_name, phone)`
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
       created_at, locality:localities(name)`
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
       is_approved_layout, landmark, status, created_at,
       locality:localities(name, mandal),
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

  const { error } = await supabase.from('inquiries').insert({
    listing_id: listingId,
    sender_id: user?.id ?? null,
    sender_name: name,
    sender_phone: phone,
    message: message || null,
  });

  if (error) throw error;
}
