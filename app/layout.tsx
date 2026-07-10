import type { Metadata } from "next";
import "./globals.css";
import { SolanaProviders } from "./providers";
import { TICKER, TOKEN_NAME } from "./config";
import { display, sans, mono } from "./fonts";

export const metadata: Metadata = {
  title: TICKER, // tab title is always just the ticker
  description: `${TOKEN_NAME} — aim, hold, and hit every target before the round runs out. A goofy arcade shooting gallery on Solana.`,
};

export const viewport = { themeColor: "#121014" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <SolanaProviders>{children}</SolanaProviders>
      </body>
    </html>
  );
}
