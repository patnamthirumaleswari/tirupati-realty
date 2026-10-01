'use client';

import { useState } from 'react';

// A collapsible section for a long checkbox list in the filters sidebar
// (Property type, Locality). Closed by default unless something in it is
// already selected, so an active filter is never hidden from view on load.
//
// Important: closing this only hides the checkboxes with CSS (`hidden`),
// it never unmounts them. If it unmounted them, a checked box would
// silently drop out of the form's data the moment you collapsed the
// section — the filter would look selected but not actually apply.
export default function FilterDropdown({ label, selectedCount = 0, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen || selectedCount > 0);

  return (
    <div className="mt-5 border-t border-[var(--color-sand)] pt-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink-softer)]">
          {label}
          {selectedCount > 0 && (
            <span className="ml-1.5 rounded-full bg-[var(--color-teal)] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {selectedCount}
            </span>
          )}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-[var(--color-ink-softer)] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className={`mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto text-sm ${open ? '' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
}
