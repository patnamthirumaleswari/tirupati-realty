import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto w-full px-6 pb-8 pt-14 md:px-8" style={{ background: 'var(--color-ink)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-9 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="font-display mb-2.5 text-lg font-semibold text-[var(--color-bg)]">
              Tirupati Realty
            </div>
            <p className="max-w-[280px] text-[13.5px] leading-relaxed text-[#9C9182]">
              A listing platform, not a broker — we don&apos;t verify title,
              ownership, or approval status. Always do your own diligence.
            </p>
          </div>

          <div>
            <div className="mb-3.5 text-[13px] font-bold text-[var(--color-bg)]">Explore</div>
            <div className="flex flex-col gap-2.5 text-[13.5px] text-[#B9AE99]">
              <Link href="/listings?type=land" className="hover:text-[var(--color-bg)]">Land for Sale</Link>
              <Link href="/listings?purpose=rent" className="hover:text-[var(--color-bg)]">Apartments for Rent</Link>
              <Link href="/listings" className="hover:text-[var(--color-bg)]">All Listings</Link>
            </div>
          </div>

          <div>
            <div className="mb-3.5 text-[13px] font-bold text-[var(--color-bg)]">Company</div>
            <div className="flex flex-col gap-2.5 text-[13.5px] text-[#B9AE99]">
              <Link href="/about" className="hover:text-[var(--color-bg)]">About</Link>
              <Link href="/contact" className="hover:text-[var(--color-bg)]">Contact</Link>
              <Link href="/terms" className="hover:text-[var(--color-bg)]">Terms of Service</Link>
              <Link href="/privacy-policy" className="hover:text-[var(--color-bg)]">Privacy Policy</Link>
            </div>
          </div>

          <div>
            <div className="mb-3.5 text-[13px] font-bold text-[var(--color-bg)]">Talk to us</div>
            <div className="text-[13.5px] text-[#B9AE99]">Tirupati, Andhra Pradesh</div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 pt-5 text-[12.5px] text-[#7A7061]">
          <div>© {new Date().getFullYear()} Tirupati Realty</div>
        </div>
      </div>
    </footer>
  );
}
