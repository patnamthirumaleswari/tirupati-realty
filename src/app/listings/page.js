import { getLocalities, searchListings } from '@/lib/queries';
import ListingCard from '@/app/components/ListingCard';
import ListingsViewToggle from '@/app/components/ListingsViewToggle';
import { formatPrice } from '@/lib/format';

export const metadata = {
  title: 'Search listings — Tirupati Realty',
};

function toArray(v) {
  if (v == null || v === '') return [];
  return Array.isArray(v) ? v : [v];
}

export default async function ListingsPage({ searchParams }) {
  const params = await searchParams;
  const selectedLocalities = toArray(params?.locality);
  const selectedTypes = toArray(params?.type);
  const selectedPurposes = toArray(params?.purpose);
  const minPrice = params?.minPrice || '';
  const maxPrice = params?.maxPrice || '';

  const [localities, listings] = await Promise.all([
    getLocalities(),
    searchListings({
      locality: selectedLocalities,
      type: selectedTypes,
      purpose: selectedPurposes,
      minPrice,
      maxPrice,
    }),
  ]);

  const activeLocalityName =
    selectedLocalities.length === 1
      ? localities.find((l) => l.id === selectedLocalities[0])?.name
      : null;

  return (
    <main className="px-6 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        {/* Filters sidebar */}
        <aside className="w-full shrink-0 lg:w-72">
          <form action="/listings" className="rounded-2xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Filters</h2>
              <a href="/listings" className="text-xs font-semibold text-[var(--color-teal)] hover:underline">
                Clear all
              </a>
            </div>

            {/* Purpose */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-softer)]">
                Looking to
              </p>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { value: 'sale', label: 'Buy' },
                  { value: 'rent', label: 'Rent' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="purpose"
                      value={opt.value}
                      defaultChecked={selectedPurposes.includes(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="mt-5 border-t border-[var(--color-sand)] pt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-softer)]">
                Property type
              </p>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { value: 'land', label: 'Land / Plot' },
                  { value: 'apartment', label: 'Apartment' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="type"
                      value={opt.value}
                      defaultChecked={selectedTypes.includes(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mt-5 border-t border-[var(--color-sand)] pt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-softer)]">
                Price (₹) — sale listings
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  defaultValue={minPrice}
                  placeholder="Min"
                  className="w-full border-b border-[var(--color-sand)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--color-teal)]"
                />
                <span className="text-[var(--color-ink-softer)]">–</span>
                <input
                  type="number"
                  name="maxPrice"
                  defaultValue={maxPrice}
                  placeholder="Max"
                  className="w-full border-b border-[var(--color-sand)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--color-teal)]"
                />
              </div>
            </div>

            {/* Locality */}
            <div className="mt-5 border-t border-[var(--color-sand)] pt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-softer)]">
                Locality
              </p>
              <div className="flex max-h-48 flex-col gap-2 overflow-y-auto text-sm">
                {localities.map((loc) => (
                  <label key={loc.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="locality"
                      value={loc.id}
                      defaultChecked={selectedLocalities.includes(loc.id)}
                    />
                    {loc.name}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-[var(--color-ink)] py-2.5 text-sm font-bold text-[var(--color-bg)] transition-transform hover:-translate-y-0.5"
            >
              Apply filters
            </button>
          </form>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
            {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
            {activeLocalityName ? ` in ${activeLocalityName}` : ''}
          </h1>

          <div className="mt-6">
            {listings.length === 0 ? (
              <p className="text-[var(--color-ink-soft)]">
                No listings match these filters yet. Try widening your search,
                or check back soon — new listings appear here once an admin
                approves them.
              </p>
            ) : (
              <ListingsViewToggle
                pins={listings
                  .filter((l) => l.latitude != null && l.longitude != null)
                  .map((l) => ({
                    id: l.id,
                    title: l.title,
                    lat: l.latitude,
                    lng: l.longitude,
                    priceLabel: formatPrice(l),
                  }))}
              >
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </ListingsViewToggle>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
