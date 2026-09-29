'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import LoginForm from '@/app/components/auth/LoginForm';
import SignupForm from '@/app/components/auth/SignupForm';
import ForgotPasswordForm from '@/app/components/auth/ForgotPasswordForm';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// The login / signup popup. It is only ever mounted while open (see
// AuthModalProvider), which keeps the setup and cleanup below simple.
export default function AuthModal({ initialMode = 'login', message, redirectTo, onClose }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [shown, setShown] = useState(false);
  const dialogRef = useRef(null);

  // Fade in on the frame after mounting.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Stop the page behind from scrolling, and remember what had focus so
  // it can be handed back on close (a keyboard user lands back on the
  // button they pressed instead of at the top of the page).
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    // Hiding the scrollbar would make the page jump sideways, so make up for it.
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  // Put the cursor in the first field whenever the form shown changes.
  useEffect(() => {
    const firstField = dialogRef.current ? dialogRef.current.querySelector('input') : null;
    if (firstField) firstField.focus();
  }, [mode]);

  // Escape closes; Tab is kept inside the dialog.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const items = Array.from(dialog.querySelectorAll(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!dialog.contains(active)) {
        // Focus has wandered outside (for example the button that was
        // focused just got replaced): pull it back in.
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function handleLoginSuccess() {
    onClose();
    if (redirectTo) router.push(redirectTo);
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex items-end justify-center bg-[var(--color-ink)]/50 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none sm:items-center sm:p-4 ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseDown={(e) => {
        // Only a press on the dark backdrop itself closes it, not a text
        // selection that started inside the dialog and ended outside.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-6 shadow-2xl transition-all duration-200 motion-reduce:transition-none sm:max-w-md sm:rounded-2xl sm:p-8 ${
          shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-[var(--color-ink-soft)] hover:bg-[var(--color-bg2)]"
        >
          ×
        </button>

        {mode === 'login' && (
          <LoginForm
            headingAs="h2"
            headingId="auth-modal-title"
            message={message}
            onSuccess={handleLoginSuccess}
            onSwitch={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot')}
          />
        )}
        {mode === 'signup' && (
          <SignupForm
            headingAs="h2"
            headingId="auth-modal-title"
            message={message}
            onSwitch={() => setMode('login')}
          />
        )}
        {mode === 'forgot' && (
          <ForgotPasswordForm
            headingAs="h2"
            headingId="auth-modal-title"
            onSwitch={() => setMode('login')}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
