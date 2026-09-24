export const metadata = {
  title: 'Contact — Tirupati Realty',
  description: 'Get in touch with Tirupati Realty.',
};

// [CONTACT EMAIL] — same placeholder as the legal pages, fill in with a
// real support address before launch.
const CONTACT_EMAIL = '[CONTACT EMAIL]';

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-3xl">Get in touch</h1>
      <p className="mt-3 text-[var(--color-ink-soft)]">
        Questions about a listing, a technical issue, or something else —
        reach out and we'll get back to you.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-3 rounded-xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-teal)]"
        >
          <span className="text-2xl">✉️</span>
          <div>
            <p className="font-semibold text-[var(--color-ink)]">Email</p>
            <p className="text-sm text-[var(--color-ink-soft)]">{CONTACT_EMAIL}</p>
          </div>
        </a>

        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-4">
          <span className="text-2xl">📍</span>
          <div>
            <p className="font-semibold text-[var(--color-ink)]">Based in</p>
            <p className="text-sm text-[var(--color-ink-soft)]">Tirupati, Andhra Pradesh</p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-[var(--color-ink-softer)]">
        For questions about a specific listing, it's usually faster to
        contact the owner directly from the listing's page.
      </p>
    </main>
  );
}
