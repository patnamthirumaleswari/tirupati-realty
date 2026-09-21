export const metadata = {
  title: 'Privacy Policy — Tirupati Realty',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Last updated: [DATE]</p>

      <div className="mt-8 flex flex-col gap-6 text-[var(--color-ink-soft)]">
        <p>
          This policy explains what information Tirupati Realty ("we", "us",
          "the site") collects when you use this website, and how it is
          used. It applies to visitors, registered users, and anyone who
          submits a property listing or an enquiry through the site.
        </p>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Information we collect</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>
              <strong>Account information:</strong> your name, email address,
              and phone number when you create an account.
            </li>
            <li>
              <strong>Listing information:</strong> anything you submit when
              posting a property — description, price, location, photos, and
              any amenities or details you choose to include.
            </li>
            <li>
              <strong>Enquiry information:</strong> if you contact a property
              owner through the site, we collect the name, phone number, and
              optional message you provide, and share these with that
              listing's owner so they can respond to you.
            </li>
            <li>
              <strong>Reports:</strong> if you report a listing, we record
              your account and the reason given, for our moderation team's
              review only.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">How we use this information</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>To operate your account and let you post, manage, and browse listings.</li>
            <li>To connect buyers/tenants with listing owners when an enquiry is made.</li>
            <li>To review listings before they go live, and to act on reports of inappropriate or inaccurate content.</li>
            <li>To send account-related emails, such as confirming your email address.</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal information to third parties, and we
            do not use it for advertising.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Who can see your information</h2>
          <p className="mt-2">
            Your name and basic profile details (such as whether you're a
            verified agent) are visible on any listing you post, since buyers
            need to know who they're dealing with. Your phone number is only
            shared with someone who submits an enquiry on your listing, or
            when you choose to reveal it — it is never shown publicly on a
            listing page itself. Listings themselves are visible to anyone
            visiting the site once approved by our moderation team.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Where your data is stored</h2>
          <p className="mt-2">
            We use Supabase (a database and authentication provider) to store
            account, listing, and enquiry data, and to handle photo storage.
            These providers may store data outside India as part of their
            standard infrastructure. We choose providers who maintain
            reasonable security practices, but no online service can
            guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Cookies and local storage</h2>
          <p className="mt-2">
            We use your browser's local storage to keep you logged in between
            visits. We do not use tracking cookies for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Your choices</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>You can edit or remove your own listings at any time from your account.</li>
            <li>You can request that we delete your account and associated personal data by contacting us at [CONTACT EMAIL].</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-[var(--color-ink)]">Contact</h2>
          <p className="mt-2">
            Questions about this policy can be sent to [CONTACT EMAIL].
          </p>
        </section>

        <p className="mt-4 border-t border-[var(--color-sand)] pt-4 text-sm">
          This page is a general-purpose draft and has not been reviewed by a
          lawyer. Before relying on it for a live public site, especially one
          collecting phone numbers and personal data, it's worth having it
          reviewed by someone qualified in Indian data protection law (the
          Digital Personal Data Protection Act, 2023, in particular).
        </p>
      </div>
    </main>
  );
}
