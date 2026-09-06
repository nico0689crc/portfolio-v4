'use client';

import type { AnchorHTMLAttributes } from 'react';
import { trackEvent, type AnalyticsEvent } from '@/lib/analytics';

/**
 * An `<a>` that reports a GA4 event when clicked.
 *
 * Exists so server components (the about, resume and footer sections) can
 * attach tracking without being converted into client components wholesale.
 * Intended for outbound and download links, which keep the page alive long
 * enough for the beacon to leave.
 */
export function TrackedLink({
  event,
  onClick,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { event: AnalyticsEvent }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackEvent(event);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
