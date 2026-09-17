'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import { getLocalities, getAmenities, createListing, uploadListingPhotos } from '@/lib/queries';

const AREA_UNITS = ['sqft', 'acres', 'cents', 'guntas'];
const FURNISHING_OPTIONS = ['unfurnished', 'semi_furnished', 'fully_furnished'];

export default function NewListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [localities, setLocalities] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photoFiles, setPhotoFiles] = useState([]);

  const [form, setForm] = useState({
    type: 'apartment',
    purpose: 'sale',
    title: '',
    description: '',
    locality_id: '',
    landmark: '',
    price_on_request: false,
    price: '',
    rent_amount: '',
    deposit_amount: '',
    area_value: '',
    area_unit: 'sqft',
    // apartment-specific
    bedrooms: '',
    bathrooms: '',
    floor_number: '',
    total_floors: '',
    property_age_years: '',
    facing_direction: '',
    furnishing: '',
    // land-specific
    plot_length: '',
    plot_width: '',
    road_width_ft: '',
    is_approved_layout: false,
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    getLocalities().then(setLocalities).catch(() => {});
    getAmenities().then(setAmenities).catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleAmenity(id) {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Build a clean payload — only send the fields relevant to the chosen
    // type, and convert empty strings to null for numeric columns.
    const num = (v) => (v === '' || v === null ? null : Number(v));

    const payload = {
      type: form.type,
      purpose: form.purpose,
      title: form.title,
      description: form.description || null,
      locality_id: form.locality_id || null,
      landmark: form.landmark || null,
      price_on_request: form.price_on_request,
      price: form.purpose !== 'rent' ? num(form.price) : null,
      rent_amount: form.purpose === 'rent' ? num(form.rent_amount) : null,
      deposit_amount: form.purpose === 'rent' ? num(form.deposit_amount) : null,
      area_value: num(form.area_value),
      area_unit: form.area_unit || null,
      ...(form.type === 'apartment'
        ? {
            bedrooms: num(form.bedrooms),
            bathrooms: num(form.bathrooms),
            floor_number: num(form.floor_number),
            total_floors: num(form.total_floors),
            property_age_years: num(form.property_age_years),
            facing_direction: form.facing_direction || null,
            furnishing: form.furnishing || null,
          }
        : {
            plot_length: num(form.plot_length),
            plot_width: num(form.plot_width),
            road_width_ft: num(form.road_width_ft),
            is_approved_layout: form.is_approved_layout,
          }),
    };

    try {
      const listing = await createListing(payload, selectedAmenities);

      if (photoFiles.length > 0) {
        // If photo upload fails, the listing itself still exists and was
        // submitted — we don't want to lose the submission over a photo
        // problem, so this is reported but doesn't block navigating on.
        try {
          await uploadListingPhotos(listing.id, photoFiles);
        } catch (photoErr) {
          console.error('Photo upload failed:', photoErr);
        }
      }

      router.push(`/dashboard?submitted=${listing.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (loading || !user) return null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl">List your property</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Your listing will be reviewed by an admin before it appears in
        search — this usually takes a short while, not instantly.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        {/* Type + purpose */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--color-ink-soft)]">Property type</label>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            >
              <option value="apartment">Apartment</option>
              <option value="land">Land</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-ink-soft)]">Purpose</label>
            <select
              value={form.purpose}
              onChange={(e) => update('purpose', e.target.value)}
              className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            >
              <option value="sale">For sale</option>
              <option value="rent">For rent</option>
              <option value="lease">For lease</option>
            </select>
          </div>
        </div>

        {/* Title + description */}
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. 2BHK apartment near Tilak Road"
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="mt-1 w-full border border-[var(--color-sand)] bg-transparent p-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--color-ink-soft)]">Locality</label>
            <select
              required
              value={form.locality_id}
              onChange={(e) => update('locality_id', e.target.value)}
              className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            >
              <option value="">Select a locality</option>
              {localities.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-ink-soft)]">Landmark (optional)</label>
            <input
              value={form.landmark}
              onChange={(e) => update('landmark', e.target.value)}
              className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <input
              type="checkbox"
              checked={form.price_on_request}
              onChange={(e) => update('price_on_request', e.target.checked)}
            />
            Price on request (don&apos;t show a number publicly)
          </label>

          {!form.price_on_request && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              {form.purpose === 'rent' ? (
                <>
                  <div>
                    <label className="block text-sm text-[var(--color-ink-soft)]">Monthly rent (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.rent_amount}
                      onChange={(e) => update('rent_amount', e.target.value)}
                      className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--color-ink-soft)]">Deposit (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.deposit_amount}
                      onChange={(e) => update('deposit_amount', e.target.value)}
                      className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm text-[var(--color-ink-soft)]">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--color-ink-soft)]">Area</label>
            <input
              type="number"
              min="0"
              value={form.area_value}
              onChange={(e) => update('area_value', e.target.value)}
              className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-ink-soft)]">Unit</label>
            <select
              value={form.area_unit}
              onChange={(e) => update('area_unit', e.target.value)}
              className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            >
              {AREA_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Apartment-specific fields */}
        {form.type === 'apartment' && (
          <div className="border border-[var(--color-sand)] p-4">
            <p className="mb-3 text-sm text-[var(--color-teal-deep)]">Apartment details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(e) => update('bedrooms', e.target.value)}
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]">Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={(e) => update('bathrooms', e.target.value)}
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]">Floor number</label>
                <input
                  type="number"
                  value={form.floor_number}
                  onChange={(e) => update('floor_number', e.target.value)}
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]">Total floors</label>
                <input
                  type="number"
                  min="0"
                  value={form.total_floors}
                  onChange={(e) => update('total_floors', e.target.value)}
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]">Property age (years)</label>
                <input
                  type="number"
                  min="0"
                  value={form.property_age_years}
                  onChange={(e) => update('property_age_years', e.target.value)}
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]">Facing direction</label>
                <input
                  value={form.facing_direction}
                  onChange={(e) => update('facing_direction', e.target.value)}
                  placeholder="e.g. East"
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-[var(--color-ink-soft)]">Furnishing</label>
                <select
                  value={form.furnishing}
                  onChange={(e) => update('furnishing', e.target.value)}
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                >
                  <option value="">Select</option>
                  {FURNISHING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Land-specific fields */}
        {form.type === 'land' && (
          <div className="border border-[var(--color-sand)] p-4">
            <p className="mb-3 text-sm text-[var(--color-teal-deep)]">Land details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]">Plot length (ft)</label>
                <input
                  type="number"
                  min="0"
                  value={form.plot_length}
                  onChange={(e) => update('plot_length', e.target.value)}
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]">Plot width (ft)</label>
                <input
                  type="number"
                  min="0"
                  value={form.plot_width}
                  onChange={(e) => update('plot_width', e.target.value)}
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]">Road width (ft)</label>
                <input
                  type="number"
                  min="0"
                  value={form.road_width_ft}
                  onChange={(e) => update('road_width_ft', e.target.value)}
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
                  <input
                    type="checkbox"
                    checked={form.is_approved_layout}
                    onChange={(e) => update('is_approved_layout', e.target.checked)}
                  />
                  DTCP/approved layout
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-[var(--color-ink-soft)]">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <label
                  key={a.id}
                  className={`cursor-pointer border px-3 py-1.5 text-sm ${
                    selectedAmenities.includes(a.id)
                      ? 'border-[var(--color-teal)] bg-[var(--color-teal)] text-[var(--color-surface)]'
                      : 'border-[var(--color-sand)] text-[var(--color-ink-soft)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedAmenities.includes(a.id)}
                    onChange={() => toggleAmenity(a.id)}
                  />
                  {a.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]">
            Photos (first one becomes the cover photo)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
            className="mt-1 w-full text-sm text-[var(--color-ink-soft)] file:mr-3 file:border file:border-[var(--color-sand)] file:bg-[var(--color-surface)] file:px-3 file:py-1.5 file:text-sm"
          />
          {photoFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {photoFiles.map((file, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 overflow-hidden border border-[var(--color-sand)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-[var(--color-teal-deep)] text-center text-[10px] text-[var(--color-surface)]">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[var(--color-teal)] px-6 py-2.5 text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit for approval'}
        </button>
      </form>
    </main>
  );
}
