'use client';

// Required by @cloudflare/next-on-pages. global-error.js is special in
// Next.js: it replaces the entire root layout (including <html>/<body>)
// when an error occurs at the root level, so it can't inherit the
// runtime export from layout.js the way ordinary pages do — it needs
// its own copy of this line.
export const runtime = 'edge';

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
        <h1>Something went wrong</h1>
        <p>Please try refreshing the page.</p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.5rem',
            background: '#2F6B62',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
