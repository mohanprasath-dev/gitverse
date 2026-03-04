import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'GitVerse — Your GitHub Galaxy',
  description:
    'Transform your GitHub activity into a cosmic 3D universe. Explore your developer galaxy.',
  keywords: ['github', 'visualization', '3d', 'developer', 'galaxy', 'cosmic'],
  authors: [{ name: 'GitVerse' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-nebula-gradient">
        <div id="app-root" className="relative min-h-screen">
          <ErrorBoundary>
            <Navbar />
            {children}
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}
