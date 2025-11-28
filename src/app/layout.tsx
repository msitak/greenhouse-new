import { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';
import { Montserrat } from 'next/font/google';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { SpeedInsights } from '@vercel/speed-insights/next';

const satoshi = localFont({
  src: [
    {
      path: '/fonts/Satoshi-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '/fonts/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '/fonts/Satoshi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '/fonts/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '/fonts/Satoshi-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
});

export const metadata: Metadata = {
  title: 'Green House Nieruchomości',
  description: 'Biuro Nieruchomości Częstochowa',
};

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pl' className={`${satoshi.variable}`}>
      <body className={`${satoshi.className} ${montserrat.variable}`}>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main>
          {children}
          <SpeedInsights />
        </main>
        <Footer />
      </body>
    </html>
  );
}
