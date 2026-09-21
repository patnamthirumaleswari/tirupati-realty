import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import FavoriteButton from '@/app/components/FavoriteButton';

export default function ListingCard({ listing }) {
  const cover =
    listing.cover_image?.find((img) => img.is_cover) || listing.cover_image?.[0];

  const badgeColor = listing.type === 'land' ? 'var(--color-green)' : 'var(--color-teal-deep)';
  const badgeLabel = `${listing.type === 'land' ? 'Land' : 'Apartment'} · ${
    listing.purpose === 'rent' ? 'Rent' : 'Sale'
  }`.toUpperCase();

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-[var(--color-sand)] bg-[var(--color-surface)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-teal)] hover:shadow-[0_24px_48px_-18px_rgba(36,28,21,0.28)]">
      {/* The favorite button sits OUTSIDE the <Link> below — an <a> can't
          contain another <a>, and the button's login-prompt popover
          contains one, so it must be a sibling, not a child, of the link. */}
      <FavoriteButton listingId={listing.id} className="absolute right-3 top-3 z-10" />

      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative h-[190px] overflow-hidden bg-[var(--color-sand)]">
          {cover?.r2_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.r2_url}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-bold text-white"
            style={{ background: badgeColor }}
          >
            {badgeLabel}
          </span>
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-display text-lg font-semibold text-[var(--color-ink)]">
              {formatPrice(listing)}
            </span>
          </div>
          <div className="text-[14.5px] font-bold text-[var(--color-ink)]">{listing.title}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[12.5px] text-[var(--color-ink-softer)]">
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
