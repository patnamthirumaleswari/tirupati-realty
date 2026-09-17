import Link from 'next/link';
import { getLocalities, getFeaturedListings } from '@/lib/queries';
import ListingCard from '@/app/components/ListingCard';

export default async function HomePage() {
  const [localities, listings] = await Promise.all([
    getLocalities(),
    getFeaturedListings(6),
  ]);

  const topLocalities = localities.slice(0, 8);

  return (
    <main>
      {/* Hero text + search */}
      <section className="border-b border-[var(--color-sand)] px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-sm text-[var(--color-teal-deep)]">
            Tirupati &amp; surrounding mandals
          </p>
          <h1 className="font-display max-w-2xl text-4xl leading-tight md:text-5xl">
            Land and apartments in Tirupati, without the runaround.
          </h1>
          <p className="mt-4 max-w-xl text-[var(--color-ink-soft)]">
            Browse listings verified by our team before they go live — every
            property here has been checked, not just posted.
          </p>

          {/* Search */}
          <form
            action="/listings"
            className="mt-10 flex flex-col gap-3 rounded-sm border border-[var(--color-sand)] bg-[var(--color-surface)] p-4 md:flex-row md:items-end"
          >
            <div className="flex-1">
              <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor="locality">
                Locality
              </label>
              <select
                id="locality"
                name="locality"
                className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
              >
                <option value="">Anywhere in Tirupati</option>
                {topLocalities.map((loc) => (
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
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Quick locality links */}
      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-2">
          {topLocalities.map((loc) => (
            <Link
              key={loc.id}
              href={`/listings?locality=${loc.id}`}
              className="border border-[var(--color-sand)] px-4 py-1.5 text-sm text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-teal)] hover:text-[var(--color-teal-deep)]"
            >
              {loc.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="px-6 pb-20 md:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display mb-6 text-2xl">Recently listed</h2>

          {listings.length === 0 ? (
            <p className="text-[var(--color-ink-soft)]">
              No live listings yet — once an admin approves a submitted
              listing, it will appear here.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
