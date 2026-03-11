import { notFound } from "next/navigation";

// This catch-all route explicitly triggers the not-found.tsx component
// whenever a user visits a route within a locale that doesn't exist.
export default function CatchAllPage() {
  notFound();
}
