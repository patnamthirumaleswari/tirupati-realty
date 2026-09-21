export const metadata = {
  title: 'Terms of Service — Tirupati Realty',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Last updated: [DATE]</p>

      <div className="mt-8 flex flex-col gap-6 text-[var(--color-ink-soft)]">
        <p>
          By using Tirupati Realty ("we", "us", "the site"), you agree to
          these terms. Please read them before creating an account or
          posting a listing.
        </p>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">What this site is</h2>
          <p className="mt-2">
            Tirupati Realty is a listings platform connecting people buying,
            selling, or renting land and apartments in and around Tirupati.
            We are not a party to any transaction between a buyer and a
            seller or landlord and tenant — we simply provide the space for
            listings to be posted and discovered.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Listings and moderation</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Every listing is reviewed by our team before it appears publicly.</li>
            <li>
              You are responsible for the accuracy of any listing you post —
              price, area, ownership status, and any claims about approvals
              (such as layout approval) must be truthful.
            </li>
            <li>
              We may reject or remove a listing at our discretion, including
              in response to a user report, without prior notice.
            </li>
            <li>
              We do not independently verify ownership, title, or the legal
              status of any property listed. Buyers and tenants should
              conduct their own due diligence, including verifying documents
              directly with the seller/landlord, before making any payment or
              commitment.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Prohibited content</h2>
          <p className="mt-2">You may not post a listing that:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>Is fraudulent, misleading, or for a property you do not have the right to list.</li>
            <li>Contains offensive, discriminatory, or unlawful content.</li>
            <li>Includes contact information or advertising unrelated to the property itself.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Account responsibilities</h2>
          <p className="mt-2">
            You're responsible for keeping your account credentials secure
            and for all activity under your account. Provide accurate contact
            information — enquiries depend on it reaching you correctly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">No warranty, limitation of liability</h2>
          <p className="mt-2">
            The site is provided "as is." We do not guarantee that any
            listing is accurate, available, or that any transaction will be
            completed successfully. To the fullest extent permitted by law,
            we are not liable for any loss arising from your use of the site
            or reliance on any listing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Changes to these terms</h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of the
            site after a change means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Contact</h2>
          <p className="mt-2">Questions can be sent to [CONTACT EMAIL].</p>
        </section>

        <p className="mt-4 border-t border-[var(--color-sand)] pt-4 text-sm">
          This page is a general-purpose draft and has not been reviewed by a
          lawyer. Before relying on it for a live public site, it's worth
          having it reviewed by someone qualified in Indian contract and
          consumer protection law.
        </p>
      </div>
    </main>
  );
}
