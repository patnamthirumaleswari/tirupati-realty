export const metadata = {
  title: 'About — Tirupati Realty',
  description: 'Why Tirupati Realty exists, and how listings get reviewed before they go live.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl">About Tirupati Realty</h1>

      <div className="mt-6 flex flex-col gap-5 text-[var(--color-ink-soft)]">
        <p>
          Tirupati Realty is a straightforward listing platform for land and
          apartments across Tirupati and the surrounding mandals — Tiruchanur,
          Renigunta, Chandragiri, Srikalahasti, and more. Buy, sell, rent, or
          lease, without wading through duplicate listings or vague pricing.
        </p>

        <p>
          Every listing is reviewed by our team before it goes live. That
          means checking that the basic details are complete and reasonable
          — it does not mean we independently verify legal title, ownership,
          or government approvals. Buyers and tenants should always do their
          own diligence before any transaction, and treat every listing
          accordingly.
        </p>

        <p>
          We built this platform because searching for property locally
          often meant scattered WhatsApp forwards, outdated newspaper
          classifieds, or brokers who don't return calls. Tirupati Realty
          is meant to be a single, current, searchable place instead.
        </p>

        <h2 className="font-display mt-4 text-xl text-[var(--color-ink)]">
          What we are — and aren't
        </h2>
        <p>
          We are a listing platform, not a broker. We don't negotiate deals,
          hold funds in escrow, or represent either party in a transaction.
          We simply give property owners a place to list, and give buyers
          and tenants a place to search.
        </p>
      </div>
    </main>
  );
}
