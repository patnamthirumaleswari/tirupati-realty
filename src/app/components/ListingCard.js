import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import FavoriteButton from '@/app/components/FavoriteButton';
import PropertyTypeIcon from '@/app/components/PropertyTypeIcon';
import { typeShortLabel, fieldTemplateFor } from '@/lib/propertyTypes';

// The short "3 BHK · 1,200 sqft" line under the title. Only includes what
// the listing actually has, so a plot shows just its area.
function factsLine(listing) {
  const parts = [];
  if (listing.bedrooms > 0) parts.push(`${listing.bedrooms} BHK`);
  if (listing.area_value) {
    parts.push(`${Number(listing.area_value).toLocaleString('en-IN')} ${listing.area_unit || ''}`.trim());
  }
  return parts.join(' · ');
}

export default function ListingCard({ listing }) {
  const cover =
    listing.cover_image?.find((img) => img.is_cover) || listing.cover_image?.[0];

  const badgeColor = fieldTemplateFor(listing.type) === 'land' ? 'var(--color-green)' : 'var(--color-teal-deep)';
  const purposeWord = { rent: 'Rent', lease: 'Lease' }[listing.purpose] || 'Sale';
  const badgeLabel = `${typeShortLabel(listing.type)} · ${purposeWord}`.toUpperCase();
  const facts = factsLine(listing);

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-[var(--color-sand)] bg-[var(--color-surface)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-teal)] hover:shadow-[0_24px_48px_-18px_rgba(36,28,21,0.28)]">
      {/* The favorite button sits OUTSIDE the <Link> below: a link must not
          contain a button (interactive content inside interactive content
          is invalid HTML and breaks clicks), so it is a sibling instead. */}
      <FavoriteButton listingId={listing.id} className="absolute right-3 top-3 z-10" />

      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative h-[190px] overflow-hidden bg-[var(--color-sand)]">
          {cover?.r2_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.r2_url}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--color-ink-softer)]"
              style={{ background: 'linear-gradient(135deg, var(--color-bg2), var(--color-sand))' }}
            >
              <PropertyTypeIcon type={listing.type} size={44} strokeWidth={1.3} />
              <span className="text-[10.5px] font-bold uppercase tracking-wider">No photo yet</span>
            </div>
          )}
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-bold text-white"
            style={{ background: badgeColor }}
          >
            {badgeLabel}
          </span>
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="font-display text-lg font-semibold text-[var(--color-ink)]">
              {formatPrice(listing)}
            </span>
            {listing.owner?.is_verified && (
              <span className="shrink-0 text-[11px] font-bold text-[var(--color-green)]">✓ Verified</span>
            )}
          </div>
          <div className="text-[14.5px] font-bold text-[var(--color-ink)]">{listing.title}</div>
          {facts && <div className="mt-0.5 text-[12.5px] text-[var(--color-ink-soft)]">{facts}</div>}
          <div className="mt-1 flex items-center gap-1 text-[12.5px] text-[var(--color-ink-softer)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
              <circle cx="12" cy="9" r="2.4" />
            </svg>
            {listing.locality?.name}
          </div>
        </div>
      </Link>
    </div>
  );
}
