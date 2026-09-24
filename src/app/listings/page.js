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

const PAGE_SIZE = 12;

export default async function ListingsPage({ searchParams }) {
  const params = await searchParams;
  const selectedLocalities = toArray(params?.locality);
  const selectedTypes = toArray(params?.type);
  const selectedPurposes = toArray(params?.purpose);
  const minPrice = params?.minPrice || '';
  const maxPrice = params?.maxPrice || '';
  const keyword = params?.keyword || '';
  const sort = params?.sort || 'newest';
  const page = Math.max(1, parseInt(params?.page, 10) || 1);

  const [localities, { listings, totalCount }] = await Promise.all([
    getLocalities(),
    searchListings({
      locality: selectedLocalities,
      type: selectedTypes,
      purpose: selectedPurposes,
      minPrice,
      maxPrice,
      keyword,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  const activeLocalityName =
    selectedLocalities.length === 1
      ? localities.find((l) => l.id === selectedLocalities[0])?.name
      : null;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Builds a /listings?... URL preserving current filters, overriding
  // just the given fields (used for pagination links, and the sort
  // dropdown's onChange via a plain <select> that submits the form).
  function buildUrl(overrides = {}) {
    const usp = new URLSearchParams();
    selectedLocalities.forEach((v) => usp.append('locality', v));
    selectedTypes.forEach((v) => usp.append('type', v));
    selectedPurposes.forEach((v) => usp.append('purpose', v));
    if (minPrice) usp.set('minPrice', minPrice);
    if (maxPrice) usp.set('maxPrice', maxPrice);
    if (keyword) usp.set('keyword', keyword);
    if (sort && sort !== 'newest') usp.set('sort', sort);
    if (page > 1) usp.set('page', String(page));

    Object.entries(overrides).forEach(([key, value]) => {
      usp.delete(key);
      if (value != null && value !== '') usp.set(key, String(value));
    });

    const qs = usp.toString();
    return qs ? `/listings?${qs}` : '/listings';
  }

  return (
    <main className="px-6 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Keyword search + sort bar */}
        <form
          action="/listings"
          className="mb-6 flex flex-col gap-3 rounded-2xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center"
        >
          <input
            type="text"
            name="keyword"
            defaultValue={keyword}
            placeholder="Search by title or description…"
            className="flex-1 border-b border-[var(--color-sand)] bg-transparent py-2 text-sm outline-none focus:border-[var(--color-teal)]"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-xs font-semibold text-[var(--color-ink-softer)]">
              Sort
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="border-b border-[var(--color-sand)] bg-transparent py-2 text-sm outline-none focus:border-[var(--color-teal)]"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded-full bg-[var(--color-teal)] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--color-teal-deep)]"
          >
            Search
          </button>
        </form>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters sidebar */}
          <aside className="w-full shrink-0 lg:w-72">
            <form action="/listings" className="rounded-2xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-5">
              {keyword && <input type="hidden" name="keyword" value={keyword} />}
              {sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}

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
              {totalCount} {totalCount === 1 ? 'listing' : 'listings'}
              {activeLocalityName ? ` in ${activeLocalityName}` : ''}
              {keyword ? ` matching "${keyword}"` : ''}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <a
                  href={page > 1 ? buildUrl({ page: page - 1 }) : undefined}
                  className={`rounded-full border border-[var(--color-sand)] px-4 py-2 text-sm font-semibold ${
                    page > 1
                      ? 'text-[var(--color-ink)] hover:border-[var(--color-teal)]'
                      : 'pointer-events-none text-[var(--color-ink-softer)] opacity-40'
                  }`}
                >
                  ‹ Prev
                </a>
                <span className="px-3 text-sm text-[var(--color-ink-soft)]">
                  Page {page} of {totalPages}
                </span>
                <a
                  href={page < totalPages ? buildUrl({ page: page + 1 }) : undefined}
                  className={`rounded-full border border-[var(--color-sand)] px-4 py-2 text-sm font-semibold ${
                    page < totalPages
                      ? 'text-[var(--color-ink)] hover:border-[var(--color-teal)]'
                      : 'pointer-events-none text-[var(--color-ink-softer)] opacity-40'
                  }`}
                >
                  Next ›
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
