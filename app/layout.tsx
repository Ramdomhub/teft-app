"use client";
import "./globals.css";
import AppWalletProvider from "./AppWalletProvider";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <Script src="https://terminal.jup.ag/main-v3.js" strategy="afterInteractive" />
      </head>
      <body>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
