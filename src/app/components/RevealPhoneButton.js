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
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white"
          style={{ background: 'var(--color-wa)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF" stroke="none">
            <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.7.7.7-2.6-.2-.3A8 8 0 1 1 12 20z" />
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
