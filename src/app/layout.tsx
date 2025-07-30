import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local'
import Header from "@/components/layout/header";

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
        <Header />
        <main>
          {children}
        </main>
        <footer className="w-full h-28 flex justify-center items-end">
          <p className="text-xs mb-2">made with 💚 by Green House &copy; {new Date(Date.now()).getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
