import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-sand)] px-6 py-8 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[var(--color-ink-soft)] sm:flex-row">
        <p>© {new Date().getFullYear()} Tirupati Realty</p>
        <div className="flex gap-4">
          <Link href="/privacy-policy" className="hover:text-[var(--color-teal-deep)]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[var(--color-teal-deep)]">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
