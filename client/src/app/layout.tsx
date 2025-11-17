import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Academy Spaces - Campus Reservation System',
  description: 'Sistem pemesanan fasilitas dan peralatan akademi untuk Telkom University',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
