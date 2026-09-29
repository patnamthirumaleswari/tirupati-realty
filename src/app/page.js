import Link from 'next/link';
import {
  getLocalities,
  getFeaturedListings,
  getLiveListingCount,
  getListingCountsByLocality,
  getLiveListingCountsByType,
  getMapPins,
} from '@/lib/queries';
import { formatPrice } from '@/lib/format';
import { PROPERTY_TYPES } from '@/lib/propertyTypes';
import ListingCard from '@/app/components/ListingCard';
import ListingsMap from '@/app/components/ListingsMap';
import PropertyTypeIcon from '@/app/components/PropertyTypeIcon';
import ProjectCard from '@/app/components/ProjectCard';
import { getProjects, getLiveUnitCountsByProject } from '@/lib/queries';

// This page shows live data (recent listings, counts, map pins). Without this
// line Next.js builds the page once, at deploy time, and serves that frozen
// copy, so a newly approved listing would not appear until the next deploy.
export const dynamic = 'force-dynamic';

// Only say things here that are true of the site as it works today. If
// how phone numbers are revealed, or who can post, ever changes, update
// the matching answer.
const FAQ = [
  {
    q: 'Is it free to post a listing?',
    a: 'Yes. Posting is free for individual owners, and there are no brokerage fees on Tirupati Realty.',
  },
  {
    q: 'Who checks the listings?',
    a: 'Every listing is reviewed by our team before it appears in search: we check that the details look complete and reasonable, and we remove spam. We do not verify legal title, ownership or government approvals, so please do your own checks before any transaction.',
  },
  {
    q: 'How do I contact an owner?',
    a: 'Open a listing and click Reveal Phone Number to see the owner\u2019s number, with a one-tap WhatsApp option, or send an inquiry from the same page. Numbers stay hidden until you ask for them.',
  },
  {
    q: 'Do I need an account?',
    a: 'You can browse, search and reveal an owner\u2019s phone number without one. You need an account to post a listing, save favorites, or report a listing.',
  },
  {
    q: 'How do I report a suspicious listing?',
    a: 'Open the listing and use Report this listing near the bottom of the page (you need to be logged in). Reports go to our review queue.',
  },
  {
    q: 'Which areas do you cover?',
    a: 'Tirupati and the areas around it, including Tiruchanur, Renigunta, Chandragiri and Srikalahasti.',
  },
];

export default async function HomePage() {
  // The type tiles and the map are optional extras: if either fails to
  // load, that section quietly disappears rather than taking the whole
  // homepage down with it.
  const [localities, listings, liveCount, localityCounts, typeCounts, pins, projects, projectUnitCounts] =
    await Promise.all([
      getLocalities(),
      getFeaturedListings(6),
      getLiveListingCount(),
      getListingCountsByLocality(),
      getLiveListingCountsByType().catch(() => ({})),
      getMapPins().catch(() => []),
      getProjects().catch(() => []),
      getLiveUnitCountsByProject().catch(() => ({})),
    ]);

  // Most recent 3 — getProjects() already orders newest first.
  const featuredProjects = projects.slice(0, 3);

  const topLocalities = localities.slice(0, 8);
  const typeTiles = PROPERTY_TYPES.filter((t) => (typeCounts[t.value] || 0) > 0);
  const mapPins = pins.map((l) => ({
    id: l.id,
    title: l.title,
    lat: l.latitude,
    lng: l.longitude,
    priceLabel: formatPrice(l),
  }));

  return (
    <main>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 pb-24 pt-16 text-center md:px-8 md:pb-28 md:pt-20"
        style={{ background: 'radial-gradient(circle at 15% 20%, var(--color-bg2) 0%, var(--color-bg) 55%)' }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-sand)] bg-[var(--color-surface)] px-4 py-1.5 text-[13px] font-bold text-[var(--color-green)]">
            <span className="h-2 w-2 rounded-full" style={{ background: '#3E7A55' }} />
            {liveCount} {liveCount === 1 ? 'listing' : 'listings'} reviewed and live right now
          </div>

          <h1 className="font-display text-[40px] font-semibold leading-[1.1] text-[var(--color-ink)] md:text-[52px]">
            Land &amp; apartments in Tirupati,{' '}
            <span className="italic" style={{ color: 'var(--color-teal)' }}>
              without the runaround.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-[var(--color-ink-soft)]">
            Buy, sell, or rent plots, land and flats across Tirupati, Tiruchanur,
            Renigunta, Chandragiri &amp; Srikalahasti — every listing checked
            by our team before it goes live.
          </p>

          {/* Search bar */}
          <form
            action="/listings"
            className="mx-auto mt-9 flex max-w-2xl items-center gap-2 rounded-[20px] border border-[var(--color-sand)] bg-[var(--color-surface)] p-2.5 shadow-[0_30px_60px_-30px_rgba(36,28,21,0.25)]"
          >
            <div className="flex flex-grow items-center gap-2.5 px-3 py-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-softer)" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <select
                name="locality"
                className="w-full bg-transparent text-[15px] text-[var(--color-ink)] outline-none"
              >
                <option value="">Search a locality — e.g. Tiruchanur, Alipiri</option>
                {topLocalities.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden h-7 w-px bg-[var(--color-sand)] sm:block" />
            <select
              name="type"
              className="hidden w-40 bg-transparent px-2 py-2 text-sm font-bold text-[var(--color-ink)] outline-none sm:block"
            >
              <option value="">Any type</option>
              <optgroup label="Residential">
                {PROPERTY_TYPES.filter((t) => t.category === 'residential').map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </optgroup>
              <optgroup label="Commercial">
                {PROPERTY_TYPES.filter((t) => t.category === 'commercial').map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </optgroup>
            </select>
            <button
              type="submit"
              className="flex items-center gap-2 whitespace-nowrap rounded-[14px] px-6 py-3.5 text-[15px] font-bold text-[var(--color-bg)] transition-transform hover:scale-[1.03]"
              style={{ background: 'var(--color-ink)' }}
            >
              Search
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          {/* Quick chips */}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/listings?type=land&purpose=sale" className="rounded-full border border-[var(--color-sand)] bg-[var(--color-bg2)] px-4.5 py-2 text-sm font-semibold text-[var(--color-ink)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)]">
              Land for Sale
            </Link>
            <Link href="/listings?type=apartment&purpose=rent" className="rounded-full border border-[var(--color-sand)] bg-[var(--color-bg2)] px-4.5 py-2 text-sm font-semibold text-[var(--color-ink)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)]">
              Apartments for Rent
            </Link>
            {topLocalities.slice(0, 2).map((loc) => (
              <Link
                key={loc.id}
                href={`/listings?locality=${loc.id}`}
                className="rounded-full border border-[var(--color-sand)] bg-[var(--color-bg2)] px-4.5 py-2 text-sm font-semibold text-[var(--color-ink)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)]"
              >
                {loc.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="px-6 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="mb-1 text-[13px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-teal)' }}>
                Fresh on the market
              </div>
              <h2 className="font-display text-[28px] font-semibold text-[var(--color-ink)]">
                Recently listed
              </h2>
            </div>
            <Link href="/listings" className="text-sm font-bold text-[var(--color-teal)] hover:underline">
              View all →
            </Link>
          </div>

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

      {/* Browse by property type: only types that have at least one live listing */}
      {typeTiles.length > 0 && (
        <section className="px-6 pb-16 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <div className="mb-1 text-[13px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-teal)' }}>
                Find what fits
              </div>
              <h2 className="font-display text-[28px] font-semibold text-[var(--color-ink)]">
                Browse by property type
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center">
              {typeTiles.map((t) => {
                const n = typeCounts[t.value];
                return (
                  <Link
                    key={t.value}
                    href={`/listings?type=${t.value}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-5 text-center transition-all hover:-translate-y-1.5 hover:border-[var(--color-teal)] hover:shadow-[0_20px_40px_-18px_rgba(36,28,21,0.2)] sm:w-[190px]"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg2)] text-[var(--color-teal)] transition-colors group-hover:bg-[var(--color-teal)] group-hover:text-[var(--color-bg)]">
                      <PropertyTypeIcon type={t.value} size={28} />
                    </span>
                    <span>
                      <span className="block text-[14.5px] font-bold text-[var(--color-ink)]">{t.label}</span>
                      <span className="block text-[12.5px] text-[var(--color-ink-softer)]">
                        {n} {n === 1 ? 'listing' : 'listings'}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Map: only shown once at least one live listing has a pinned location */}
      {mapPins.length > 0 && (
        <section className="px-6 pb-16 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className="mb-1 text-[13px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-teal)' }}>
                  See where it is
                </div>
                <h2 className="font-display text-[28px] font-semibold text-[var(--color-ink)]">
                  Explore listings on the map
                </h2>
              </div>
              <Link href="/listings" className="text-sm font-bold text-[var(--color-teal)] hover:underline">
                Search with filters →
              </Link>
            </div>
            <ListingsMap pins={mapPins} heightClass="h-[420px]" />
            <p className="mt-2 text-xs text-[var(--color-ink-softer)]">
              Showing {mapPins.length} {mapPins.length === 1 ? 'listing' : 'listings'} with a pinned location. Click a pin for details.
            </p>
          </div>
        </section>
      )}

      {/* New projects: only shown once at least one project exists */}
      {featuredProjects.length > 0 && (
        <section className="px-6 pb-16 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className="mb-1 text-[13px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-teal)' }}>
                  By local builders
                </div>
                <h2 className="font-display text-[28px] font-semibold text-[var(--color-ink)]">
                  New projects
                </h2>
              </div>
              <Link href="/projects" className="text-sm font-bold text-[var(--color-teal)] hover:underline">
                View all projects →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  liveUnits={projectUnitCounts[project.id] || 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular localities */}
      <section className="px-6 py-16 text-center md:px-8" style={{ background: 'var(--color-bg2)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-2 text-[13px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-teal)' }}>
            Where people are looking
          </div>
          <h2 className="font-display mb-9 text-[28px] font-semibold text-[var(--color-ink)]">
            Popular localities around Tirupati
          </h2>
          <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
            {topLocalities.map((loc) => {
              const count = localityCounts[loc.id] || 0;
              return (
                <Link
                  key={loc.id}
                  href={`/listings?locality=${loc.id}`}
                  className="flex items-center justify-between rounded-2xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-5 transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-18px_rgba(36,28,21,0.2)]"
                >
                  <div>
                    <div className="text-[16px] font-bold text-[var(--color-ink)]">{loc.name}</div>
                    <div className="text-[13px] text-[var(--color-ink-softer)]">
                      {count} {count === 1 ? 'listing' : 'listings'}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="3">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 text-center md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-2 text-[13px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-teal)' }}>
            No brokerage. No middlemen.
          </div>
          <h2 className="font-display mb-11 text-[28px] font-semibold text-[var(--color-ink)]">
            How Tirupati Realty works
          </h2>
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: 1, title: 'Create an account', body: 'Sign up with your email — as a buyer, owner, agent, or builder.' },
              { n: 2, title: 'Post or search listings', body: 'Land, plots, or flats — with photos, exact locality, and a map pin.' },
              { n: 3, title: 'We review before it\u2019s live', body: 'Every listing passes an admin check first — our biggest lever against spam.' },
              { n: 4, title: 'Connect directly', body: 'Reveal the number or send an inquiry — no middleman fee, ever.' },
            ].map((step) => (
              <div key={step.n}>
                <div
                  className="font-display mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl transition-transform hover:scale-110 hover:-rotate-6"
                  style={{ background: 'var(--color-ink)', color: 'var(--color-bg)' }}
                >
                  {step.n}
                </div>
                <div className="mb-2 text-[16px] font-bold text-[var(--color-ink)]">{step.title}</div>
                <div className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{step.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 md:px-8" style={{ background: 'var(--color-bg2)' }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 text-center text-[13px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-teal)' }}>
            Good to know
          </div>
          <h2 className="font-display mb-8 text-center text-[28px] font-semibold text-[var(--color-ink)]">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-bold text-[var(--color-ink)] [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-xl leading-none text-[var(--color-teal)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-6 py-14 md:px-8" style={{ background: 'var(--color-green)' }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: 'Owner-declared, clearly labelled',
              body: "We don't verify land title or approval status — every listing says so, plainly.",
            },
            {
              title: 'Numbers stay masked',
              body: 'A phone number stays hidden until a visitor clicks Reveal, and every reveal is logged. It is never shown publicly by default.',
            },
            {
              title: "Moderated before it's public",
              body: 'Nothing appears in search until an admin has approved it — no exceptions.',
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3.5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-greenlight)" strokeWidth="1.8" className="shrink-0">
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
              </svg>
              <div>
                <div className="mb-1 text-[15px] font-bold text-[var(--color-bg)]">{item.title}</div>
                <div className="text-[13.5px] leading-relaxed" style={{ color: '#B8C7B4' }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 md:px-8">
        <div
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] px-8 py-14 md:px-14"
          style={{ background: 'linear-gradient(120deg, var(--color-teal), var(--color-teal-deep))' }}
        >
          <div className="relative z-10 max-w-lg">
            <h2 className="font-display mb-3.5 text-[28px] font-semibold text-[var(--color-bg)]">
              Got land or a flat to list?
            </h2>
            <p className="mb-7 text-[16px] leading-relaxed" style={{ color: '#F6E3D2' }}>
              It&apos;s free for individual owners, takes under five minutes,
              and goes live after a quick review. No brokerage, ever.
            </p>
            <Link
              href="/listings/new"
              className="inline-block rounded-full px-7 py-3.5 text-[15px] font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--color-bg)', color: 'var(--color-teal-deep)' }}
            >
              Post your listing free →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
