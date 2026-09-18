import Link from 'next/link';
import { getLocalities, getFeaturedListings } from '@/lib/queries';
import ListingCard from '@/app/components/ListingCard';

const CATEGORY_TABS = [
  { label: 'All', href: '/listings' },
  { label: 'Buy', href: '/listings?purpose=sale' },
  { label: 'Rent', href: '/listings?purpose=rent' },
  { label: 'Land', href: '/listings?type=land' },
  { label: 'Apartments', href: '/listings?type=apartment' },
];

export default async function HomePage() {
  const [localities, listings] = await Promise.all([
    getLocalities(),
    getFeaturedListings(6),
  ]);

  const topLocalities = localities.slice(0, 8);

  return (
    <main>
      {/* Hero band */}
      <section
        className="px-6 pt-14 pb-28 md:px-12 md:pt-20 md:pb-36"
        style={{
          background:
            'linear-gradient(135deg, var(--color-teal-deep), var(--color-teal))',
        }}
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm text-[var(--color-surface)] opacity-80">
            Tirupati &amp; surrounding mandals
          </p>
          <h1 className="font-display mt-3 text-4xl leading-tight text-[var(--color-surface)] md:text-5xl">
            Land and apartments in Tirupati, without the runaround.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[var(--color-surface)] opacity-90">
            Every listing here is checked by our team before it goes live.
          </p>
        </div>
      </section>

      {/* Floating search card, overlapping the hero band */}
      <section className="px-6 md:px-12">
        <div className="mx-auto -mt-16 max-w-4xl rounded-sm bg-[var(--color-surface)] shadow-lg md:-mt-20">
          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-sand)] px-2 pt-2">
            {CATEGORY_TABS.map((tab, i) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`whitespace-nowrap px-4 py-2.5 text-sm ${
                  i === 0
                    ? 'border-b-2 border-[var(--color-teal)] font-medium text-[var(--color-teal-deep)]'
                    : 'text-[var(--color-ink-soft)] hover:text-[var(--color-teal-deep)]'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Search form */}
          <form action="/listings" className="flex flex-col gap-3 p-5 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-xs text-[var(--color-ink-soft)]" htmlFor="locality">
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
              <label className="block text-xs text-[var(--color-ink-soft)]" htmlFor="type">
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
              <label className="block text-xs text-[var(--color-ink-soft)]" htmlFor="purpose">
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
              className="bg-[var(--color-teal)] px-8 py-2.5 text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)]"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Quick locality links */}
      <section className="px-6 pt-10 md:px-12">
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
      <section className="px-6 py-14 md:px-12">
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
