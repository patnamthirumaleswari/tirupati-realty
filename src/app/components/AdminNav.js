'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin/listings', label: 'Pending listings' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/localities', label: 'Localities' },
  { href: '/admin/amenities', label: 'Amenities' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex gap-1 border-b border-[var(--color-sand)]">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 text-sm ${
              active
                ? 'border-b-2 border-[var(--color-teal)] text-[var(--color-teal-deep)]'
                : 'text-[var(--color-ink-soft)] hover:text-[var(--color-teal-deep)]'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
