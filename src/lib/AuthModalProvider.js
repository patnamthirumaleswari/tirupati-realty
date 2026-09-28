'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import AuthModal from '@/app/components/AuthModal';

const AuthModalContext = createContext(null);

// On these pages the whole page already IS a login/signup form, so there
// is no point stacking a popup on top of it.
const AUTH_PAGES = ['/login', '/signup'];

// Lets any component open the login/signup popup:
//
//   const { openAuthModal } = useAuthModal();
//   openAuthModal({ mode: 'login', message: 'Log in to save this listing.' });
//
// or turn an ordinary link into one that opens the popup:
//
//   <Link href="/login" {...authLinkProps({ mode: 'login' })}>Log in</Link>
//
// Options: mode ('login' | 'signup'), message (shown under the heading),
// redirectTo (where to go after a successful login).
export function AuthModalProvider({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [modal, setModal] = useState(null); // null = closed

  const openAuthModal = useCallback(
    (options = {}) => {
      if (user) return; // already logged in, nothing to ask for
      setModal({
        mode: options.mode || 'login',
        message: options.message,
        redirectTo: options.redirectTo,
      });
    },
    [user]
  );

  const closeAuthModal = useCallback(() => setModal(null), []);

  // If the visitor becomes logged in by any route (this popup, or another
  // browser tab), the popup has done its job.
  useEffect(() => {
    if (user) setModal(null);
  }, [user]);

  // Props for a <Link href="/login">. The link keeps its real href, so
  // right-click, ctrl/cmd-click and "open in new tab" still behave like a
  // normal link; only a plain click opens the popup instead.
  const authLinkProps = useCallback(
    (options = {}) => ({
      onClick: (e) => {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (AUTH_PAGES.includes(pathname)) return;
        e.preventDefault();
        openAuthModal(options);
      },
    }),
    [pathname, openAuthModal]
  );

  const value = useMemo(
    () => ({ openAuthModal, closeAuthModal, authLinkProps }),
    [openAuthModal, closeAuthModal, authLinkProps]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {modal && (
        <AuthModal
          initialMode={modal.mode}
          message={modal.message}
          redirectTo={modal.redirectTo}
          onClose={closeAuthModal}
        />
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used inside <AuthModalProvider>');
  }
  return ctx;
}
