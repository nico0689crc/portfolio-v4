'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Sends a page_view on client-side navigations.
 *
 * `gtag('config')` fires the page_view for the initial load, so the first
 * pathname is skipped to avoid counting the landing page twice. Reading the
 * title after paint means the event carries the page's real <title>, not the
 * previous route's.
 */
export function PageViewTracker({ locale }: { locale: string }) {
  const pathname = usePathname();
  const initialPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === initialPathname.current) return;

    // The document title updates during commit; defer a frame so the event
    // reports the destination page rather than the one being left.
    const id = requestAnimationFrame(() => {
      trackPageView({
        url: window.location.href,
        title: document.title,
        locale
      });
    });

    return () => cancelAnimationFrame(id);
  }, [pathname, locale]);

  return null;
}
