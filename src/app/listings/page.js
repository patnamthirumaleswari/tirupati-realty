import { getLocalities, searchListings } from '@/lib/queries';
import ListingCard from '@/app/components/ListingCard';

// Required by @cloudflare/next-on-pages: any dynamic (server-rendered)
// route must explicitly opt into the Edge Runtime.
export const runtime = 'edge';

export const metadata = {
  title: 'Search listings — Tirupati Realty',
};

export default async function ListingsPage({ searchParams }) {
  const params = await searchParams;
  const locality = params?.locality || '';
  const type = params?.type || '';
  const purpose = params?.purpose || '';

  const [localities, listings] = await Promise.all([
    getLocalities(),
    searchListings({ locality, type, purpose }),
  ]);

  const activeLocalityName = localities.find((l) => l.id === locality)?.name;

  return (
    <main className="px-6 py-12 md:px-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl">
          {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
          {activeLocalityName ? ` in ${activeLocalityName}` : ''}
        </h1>

        {/* Refine filters */}
        <form
          action="/listings"
          className="mt-6 flex flex-col gap-3 border border-[var(--color-sand)] bg-[var(--color-surface)] p-4 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor="locality">
              Locality
            </label>
            <select
              id="locality"
              name="locality"
              defaultValue={locality}
              className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            >
              <option value="">Anywhere in Tirupati</option>
              {localities.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor="type">
              Property type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={type}
              className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            >
              <option value="">Land or apartment</option>
              <option value="land">Land</option>
              <option value="apartment">Apartment</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor="purpose">
              Looking to
            </label>
            <select
              id="purpose"
              name="purpose"
              defaultValue={purpose}
              className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            >
              <option value="">Buy or rent</option>
              <option value="sale">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-[var(--color-teal)] px-6 py-2.5 text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)]"
          >
            Update
          </button>
        </form>

        {/* Results */}
        <div className="mt-10">
          {listings.length === 0 ? (
            <p className="text-[var(--color-ink-soft)]">
              No listings match these filters yet. Try widening your search,
              or check back soon — new listings appear here once an admin
              approves them.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
