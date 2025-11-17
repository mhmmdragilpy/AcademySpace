/*
 * ========================================
 * FILE: client/src/components/Layout.tsx (PERBAIKAN BACKGROUND & COLORS)
 * ========================================
 */
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  user?: any;
}

export default function Layout({ children, showNavigation = true, user }: LayoutProps) {
  // Menggunakan class bg-secondary-dark dan text-gray-800 sebagai default app color
  return (
    <div className="min-h-screen bg-secondary-dark text-gray-800 flex flex-col">
      <Header showNavigation={showNavigation} user={user} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
