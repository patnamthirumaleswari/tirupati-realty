import { Fraunces, Work_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthProvider';
import Navbar from '@/app/components/Navbar';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-fraunces',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-work-sans',
});

export const metadata = {
  title: 'Tirupati Realty — Land & Apartments in Tirupati',
  description:
    'Find land and apartments for sale or rent across Tirupati — Tilak Road, Renigunta, Tiruchanur, Chandragiri and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${workSans.variable}`}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
