import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import localFont from 'next/font/local'

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
})

export const metadata: Metadata = {
  title: "Green House Nieruchomości",
  description: "Biuro Nieruchomości Częstochowa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={satoshi.className}>
        <header style={{ display: "flex", justifyContent: "center" }}>
          <Image src="logo.svg" alt="Green House Nieruchomości" width={100} height={100} />
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
