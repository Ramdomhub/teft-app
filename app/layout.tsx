import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import Navigation from "./components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TEFT Legion",
  description: "The curated elite of the TEFT ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-black selection:text-white`}>
        <Providers>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="py-12 flex flex-col items-center opacity-30">
            <p className="text-[9px] font-black uppercase tracking-[0.5em]">Natively built on Solana • TEFT Ecosystem</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
