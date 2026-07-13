import type { Metadata } from "next";
import { TICKER } from "../config";
import DocsContent from "./DocsContent";

export const metadata: Metadata = {
  title: `${TICKER} Docs`,
  description: "Field manual for Piss Target — gameplay, targets, scoring, and the token.",
};

export default function DocsPage() {
  return <DocsContent />;
}
