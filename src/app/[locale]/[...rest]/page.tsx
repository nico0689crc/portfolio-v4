import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Unknown routes must never be indexed, and must not inherit the layout's
// canonical — that would make every 404 look like a copy of the homepage.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

// This catch-all route explicitly triggers the not-found.tsx component
// whenever a user visits a route within a locale that doesn't exist.
export default function CatchAllPage() {
  notFound();
}
