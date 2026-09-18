import { getListingById } from '@/lib/queries';
import { formatPrice } from '@/lib/format';
import ContactOwnerForm from '@/app/components/ContactOwnerForm';
import ReportListingButton from '@/app/components/ReportListingButton';

// Required by @cloudflare/next-on-pages: any dynamic (server-rendered)
// route must explicitly opt into the Edge Runtime.
export const runtime = 'edge';

export default async function ListingDetailPage({ params }) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-2xl">Listing not found</h1>
        <p className="mt-2 text-[var(--color-ink-soft)]">
          This listing may have been removed, or isn&apos;t live yet.
        </p>
      </main>
    );
  }

  const cover =
    listing.images?.find((img) => img.is_cover) || listing.images?.[0];
  const amenityNames = (listing.amenities || []).map((a) => a.amenity?.name).filter(Boolean);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 md:px-12">
      {/* Image */}
      <div className="aspect-[16/9] bg-[var(--color-sand)]">
        {cover?.r2_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.r2_url}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-3">
        {/* Main details */}
        <div className="md:col-span-2">
          <span className="text-sm text-[var(--color-teal-deep)]">
            {listing.purpose === 'rent' ? 'For rent' : listing.purpose === 'lease' ? 'For lease' : 'For sale'}
            {' · '}
            {listing.type === 'land' ? 'Land' : 'Apartment'}
          </span>
          <h1 className="font-display mt-1 text-3xl">{listing.title}</h1>
          <p className="mt-1 text-[var(--color-ink-soft)]">
            {listing.locality?.name}
            {listing.landmark ? ` · Near ${listing.landmark}` : ''}
          </p>
          <p className="mt-3 text-2xl text-[var(--color-brick)]">{formatPrice(listing)}</p>

          {/* Key facts */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-[var(--color-sand)] py-4 text-sm">
            {listing.area_value && (
              <span>{listing.area_value} {listing.area_unit}</span>
            )}
            {listing.type === 'apartment' && (
              <>
                {listing.bedrooms != null && <span>{listing.bedrooms} BHK</span>}
                {listing.bathrooms != null && <span>{listing.bathrooms} bath</span>}
                {listing.floor_number != null && listing.total_floors != null && (
                  <span>Floor {listing.floor_number} of {listing.total_floors}</span>
                )}
                {listing.furnishing && <span className="capitalize">{listing.furnishing.replace('_', ' ')}</span>}
                {listing.facing_direction && <span>{listing.facing_direction} facing</span>}
              </>
            )}
            {listing.type === 'land' && (
              <>
                {listing.plot_length && listing.plot_width && (
                  <span>{listing.plot_length} × {listing.plot_width} ft</span>
                )}
                {listing.road_width_ft && <span>{listing.road_width_ft} ft road</span>}
                {listing.is_approved_layout && <span>DTCP/approved layout</span>}
              </>
            )}
          </div>

          {listing.description && (
            <div className="mt-6">
              <h2 className="font-display text-lg">Description</h2>
              <p className="mt-2 whitespace-pre-line text-[var(--color-ink-soft)]">
                {listing.description}
              </p>
            </div>
          )}

          {amenityNames.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-lg">Amenities</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {amenityNames.map((name) => (
                  <span
                    key={name}
                    className="border border-[var(--color-sand)] px-3 py-1 text-sm text-[var(--color-ink-soft)]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Owner + contact */}
        <div>
          <div className="border border-[var(--color-sand)] bg-[var(--color-surface)] p-4">
            <p className="text-sm text-[var(--color-ink-soft)]">Posted by</p>
            <p className="font-display mt-1">
              {listing.owner?.full_name || 'Owner'}
              {listing.owner?.is_verified && (
                <span className="ml-2 text-xs text-[var(--color-teal-deep)]">✓ Verified</span>
              )}
            </p>
            {listing.owner?.agency_name && (
              <p className="text-sm text-[var(--color-ink-soft)]">{listing.owner.agency_name}</p>
            )}
          </div>

          <div className="mt-4 border border-[var(--color-sand)] p-4">
            <h2 className="font-display mb-3 text-lg">Contact owner</h2>
            <ContactOwnerForm listingId={listing.id} />
          </div>

          <div className="mt-4">
            <ReportListingButton listingId={listing.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
