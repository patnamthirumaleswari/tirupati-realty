'use client';

import { useState } from 'react';
import { revealOwnerPhone } from '@/lib/queries';

// Formats a phone number for a wa.me link: strips everything but digits,
// and assumes a bare 10-digit Indian number needs the 91 country code
// prepended (numbers already stored with a country code are left as-is).
function toWhatsAppNumber(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export default function RevealPhoneButton({ listingId }) {
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleReveal() {
    setLoading(true);
    setError('');
    try {
      const result = await revealOwnerPhone(listingId);
      setPhone(result);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  if (phone) {
    return (
      <div className="flex flex-col gap-2">
        <a
          href={`tel:${phone}`}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white"
          style={{ background: 'var(--color-ink)' }}
        >
          {phone}
        </a>
        <a
          href={`https://wa.me/${toWhatsAppNumber(phone)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <svg width="18" height="18" viewBox="0 0 32 32" fill="#FFF">
            <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.905 6.474L4 29l7.72-1.867A11.93 11.93 0 0 0 16.001 27C22.629 27 28 21.627 28 15S22.629 3 16.001 3zm6.994 17.06c-.294.828-1.463 1.516-2.4 1.716-.64.135-1.475.243-4.287-.921-3.598-1.49-5.914-5.146-6.095-5.386-.178-.24-1.454-1.937-1.454-3.695s.917-2.62 1.243-2.98c.325-.36.71-.45.947-.45.238 0 .474.002.681.012.219.01.512-.083.802.612.294.706 1 2.435 1.087 2.612.088.177.147.386.03.626-.118.24-.176.386-.353.593-.177.207-.372.462-.53.62-.176.176-.36.367-.155.72.206.353.914 1.508 1.964 2.44 1.35 1.198 2.487 1.569 2.842 1.745.354.177.56.148.767-.089.206-.238.883-1.03 1.12-1.383.235-.354.47-.294.796-.176.324.117 2.056.97 2.409 1.147.353.177.588.264.676.412.088.148.088.86-.206 1.688z" />
          </svg>
          Chat on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleReveal}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
        style={{ background: 'var(--color-teal)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M7 11V8a5 5 0 0 1 10 0v3" />
        </svg>
        {loading ? 'Revealing…' : 'Reveal Phone Number'}
      </button>
      {error && <p className="mt-2 text-xs text-[var(--color-brick)]">{error}</p>}
    </div>
  );
}
