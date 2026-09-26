import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Streaker 🔥 — Habit Staking on Monad Testnet',
  description:
    'Social habit-staking with sub-second finality on Monad. Daily streaks, peer consensus, and micro-stakes. Build streaks or get burned.',
  applicationName: 'Streaker',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Streaker' },
  icons: { icon: '/icon.svg', apple: '/icon-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#101013',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
