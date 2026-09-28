'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { getPropertyType, typeLabel, fieldTemplateFor } from '@/lib/propertyTypes';
import ListingGallery from '@/app/components/ListingGallery';

function daysWaiting(createdAt) {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

// Builds the list of label/value facts to show in the expanded view —
// only includes fields that actually have a value, so an admin sees
// what was provided (and, just as usefully, what wasn't).
function buildFacts(listing) {
  const facts = [];
  const add = (label, value) => {
    if (value !== null && value !== undefined && value !== '') facts.push({ label, value });
  };

  if (listing.area_value) add('Area', `${listing.area_value} ${listing.area_unit || ''}`.trim());

  if (listing.purpose === 'rent') {
    add('Monthly rent', listing.rent_amount ? `₹${Number(listing.rent_amount).toLocaleString('en-IN')}` : null);
    add('Deposit', listing.deposit_amount ? `₹${Number(listing.deposit_amount).toLocaleString('en-IN')}` : null);
  }

  if (fieldTemplateFor(listing.type) === 'building') {
    add('Bedrooms', listing.bedrooms);
    add('Bathrooms', listing.bathrooms);
    if (listing.floor_number != null) {
      add('Floor', listing.total_floors != null ? `${listing.floor_number} of ${listing.total_floors}` : listing.floor_number);
    }
    add('Property age', listing.property_age_years != null ? `${listing.property_age_years} years` : null);
    add('Facing', listing.facing_direction);
    add('Furnishing', listing.furnishing ? listing.furnishing.replace(/_/g, ' ') : null);
  } else {
    if (listing.plot_length && listing.plot_width) {
      add('Plot size', `${listing.plot_length} × ${listing.plot_width} ft`);
    }
    add('Road width', listing.road_width_ft ? `${listing.road_width_ft} ft` : null);
    add('DTCP / approved layout', listing.is_approved_layout ? 'Yes' : 'No');
  }

  add('Landmark', listing.landmark);
  return facts;
}

export default function PendingListingCard({
  listing,
  revealedPhone,
  onReveal,
  onAction,
  actioning,
}) {
  const [expanded, setExpanded] = useState(false);

  const images = listing.images || [];
  const cover = images.find((i) => i.is_cover) || images[0];
  const facts = buildFacts(listing);
  const amenityNames = (listing.amenities || []).map((a) => a.amenity?.name).filter(Boolean);
  const category = getPropertyType(listing.type)?.category;
  const purposeLabel =
    listing.purpose === 'rent' ? 'For rent' : listing.purpose === 'lease' ? 'For lease' : 'For sale';

  // A function (not a shared element) so the same Approve/Reject buttons
  // can be rendered in two places with different layouts.
  const renderActionButtons = (layoutClass) => (
    <div className={layoutClass}>
      <button
        disabled={actioning}
        onClick={() => onAction(listing.id, 'live')}
        className="bg-[var(--color-teal)] px-4 py-1.5 text-sm text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
      >
        Approve
      </button>
      <button
        disabled={actioning}
        onClick={() => onAction(listing.id, 'rejected')}
        className="border border-[var(--color-sand)] px-4 py-1.5 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-brick)] hover:text-[var(--color-brick)] disabled:opacity-60"
      >
        Reject
      </button>
    </div>
  );

  return (
    <li className="border border-[var(--color-sand)] bg-[var(--color-surface)] p-4">
      {/* Summary row — always visible */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="h-28 w-full shrink-0 overflow-hidden bg-[var(--color-sand)] sm:w-40">
          {cover?.r2_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.r2_url} alt={listing.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-xs font-semibold text-[var(--color-brick)]">
              No photos uploaded
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display text-lg">{listing.title}</p>
          <p className="text-sm text-[var(--color-ink-soft)]">
            {category ? `${category === 'commercial' ? 'Commercial' : 'Residential'} · ` : ''}
            {typeLabel(listing.type)} · {purposeLabel}
          </p>
          <p className="text-sm text-[var(--color-ink-soft)]">
            {listing.locality?.name}
            {listing.locality?.mandal ? `, ${listing.locality.mandal}` : ''}
          </p>
          <p className="mt-1 text-[var(--color-brick)]">
            {formatPrice(listing)}
            {listing.area_value ? (
              <span className="text-[var(--color-ink-soft)]">
                {' '}
                · {listing.area_value} {listing.area_unit}
              </span>
            ) : null}
          </p>
          <p className="mt-2 text-xs text-[var(--color-ink-soft)]">
            Posted by <strong>{listing.owner?.full_name || 'Unknown'}</strong>
            {listing.owner?.is_verified && <span className="text-[var(--color-teal-deep)]"> ✓ Verified</span>}
            {listing.owner?.agency_name ? ` (${listing.owner.agency_name})` : ''}
            {' · '}
            {daysWaiting(listing.created_at)}
            {' · '}
            {revealedPhone ? (
              revealedPhone
            ) : (
              <button
                onClick={() => onReveal(listing.id)}
                className="underline hover:text-[var(--color-teal-deep)]"
              >
                reveal phone
              </button>
            )}
          </p>
        </div>

        {renderActionButtons('flex shrink-0 gap-2 sm:flex-col')}
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-3 text-sm font-semibold text-[var(--color-teal)] hover:underline"
      >
        {expanded ? 'Hide full details ▴' : 'Show full details ▾'}
      </button>

      {/* Full review — expanded on demand */}
      {expanded && (
        <div className="mt-4 flex flex-col gap-5 border-t border-[var(--color-sand)] pt-4">
          {images.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-softer)]">
                Photos ({images.length}) — click a photo to enlarge
              </p>
              <ListingGallery images={images} title={listing.title} />
            </div>
          ) : (
            <p className="text-sm font-semibold text-[var(--color-brick)]">
              This listing has no photos.
            </p>
          )}

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-softer)]">
              Description
            </p>
            {listing.description ? (
              <p className="whitespace-pre-line text-sm text-[var(--color-ink-soft)]">
                {listing.description}
              </p>
            ) : (
              <p className="text-sm italic text-[var(--color-ink-softer)]">No description provided.</p>
            )}
          </div>

          {facts.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-softer)]">
                Details
              </p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-xs text-[var(--color-ink-softer)]">{f.label}</dt>
                    <dd className="capitalize text-[var(--color-ink)]">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {amenityNames.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-softer)]">
                Amenities
              </p>
              <div className="flex flex-wrap gap-2">
                {amenityNames.map((n) => (
                  <span key={n} className="border border-[var(--color-sand)] px-2.5 py-1 text-xs text-[var(--color-ink-soft)]">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {listing.latitude != null && listing.longitude != null ? (
              <a
                href={`https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=17/${listing.latitude}/${listing.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-teal)] hover:underline"
              >
                View pinned location on map ↗
              </a>
            ) : (
              <span className="text-[var(--color-ink-softer)]">No map location pinned</span>
            )}
            <Link href={`/listings/${listing.id}`} target="_blank" className="text-[var(--color-teal)] hover:underline">
              Open as a visitor would see it ↗
            </Link>
          </div>

          {/* Repeat the actions here so an admin who's just reviewed the
              full listing doesn't have to scroll back up to decide. */}
          <div className="flex items-center gap-3 border-t border-[var(--color-sand)] pt-4">
            <span className="text-sm text-[var(--color-ink-soft)]">Decision:</span>
            {renderActionButtons('flex gap-2')}
          </div>
        </div>
      )}
    </li>
  );
}
