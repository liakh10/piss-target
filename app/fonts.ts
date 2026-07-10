import { Bangers, Inter, JetBrains_Mono } from "next/font/google";

// Piss Target identity — a loud comic-book splash font (Bangers), unused elsewhere
// in the hub (distinct from Titan One / Fredoka / Cinzel / Orbitron / Baloo / Fraunces).
export const display = Bangers({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});
export const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});
