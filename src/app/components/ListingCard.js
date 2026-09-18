import Link from 'next/link';
import { formatPrice } from '@/lib/format';

export default function ListingCard({ listing }) {
  const cover =
    listing.cover_image?.find((img) => img.is_cover) || listing.cover_image?.[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block border border-[var(--color-sand)] bg-[var(--color-surface)] transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[var(--color-sand)]">
        {cover?.r2_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.r2_url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-4">
        <span className="text-xs text-[var(--color-teal-deep)]">
          {listing.purpose === 'rent' ? 'For rent' : 'For sale'} ·{' '}
          {listing.type === 'land' ? 'Land' : 'Apartment'}
        </span>
        <h3 className="mt-1 font-display text-lg leading-snug group-hover:text-[var(--color-teal-deep)]">
          {listing.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          {listing.locality?.name}
        </p>
        <p className="mt-2 text-[var(--color-brick)]">{formatPrice(listing)}</p>
      </div>
    </Link>
  );
}
