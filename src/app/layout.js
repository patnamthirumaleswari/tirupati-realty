import { Fraunces, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthProvider';
import { FavoritesProvider } from '@/lib/FavoritesProvider';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-fraunces',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});

const SITE_URL = 'https://tirupati-realty.pages.dev';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tirupati Realty — Land & Apartments in Tirupati',
    template: '%s | Tirupati Realty',
  },
  description:
    'Find land and apartments for sale or rent across Tirupati — Tilak Road, Renigunta, Tiruchanur, Chandragiri and more.',
  openGraph: {
    type: 'website',
    siteName: 'Tirupati Realty',
    title: 'Tirupati Realty — Land & Apartments in Tirupati',
    description:
      'Find land and apartments for sale or rent across Tirupati — verified listings, reviewed before they go live.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary',
    title: 'Tirupati Realty — Land & Apartments in Tirupati',
    description:
      'Find land and apartments for sale or rent across Tirupati.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable} flex min-h-screen flex-col`}>
        <AuthProvider>
          <FavoritesProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
