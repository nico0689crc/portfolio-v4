/**
 * Typed GA4 event layer.
 *
 * Every event the site sends is declared here so names and parameters can't
 * drift across components — GA4 has no schema, so a typo silently creates a
 * brand-new event that never shows up in your reports.
 *
 * Naming follows GA4 conventions: snake_case, verb_noun, parameters flat.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const CONSENT_STORAGE_KEY = 'portfolio.consent.v1';

export type ConsentChoice = 'granted' | 'denied';

/** Where a CV download was triggered from. */
export type CvLocation = 'home' | 'about' | 'resume';

/** Which outbound resource a project link points at. */
export type ProjectLinkType = 'demo' | 'github' | 'canva' | 'figjam' | 'lofi';

export type AnalyticsEvent =
  | { name: 'cv_download'; params: { file_language: string; source: CvLocation } }
  | { name: 'contact_submit'; params: { status: 'success' | 'error' } }
  | {
      name: 'project_link_click';
      params: {
        project: string;
        link_type: ProjectLinkType;
        source: 'portfolio' | 'case_study';
      };
    }
  | { name: 'case_study_open'; params: { project: string } }
  | { name: 'social_click'; params: { network: 'linkedin' | 'github' | 'email' } }
  | { name: 'language_switch'; params: { from: string; to: string } };

type GtagArgs =
  | [command: 'event', name: string, params?: Record<string, unknown>]
  | [command: 'consent', action: 'default' | 'update', params: Record<string, unknown>]
  | [command: 'config', targetId: string, params?: Record<string, unknown>]
  | [command: 'js', date: Date];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

function push(...args: GtagArgs) {
  if (typeof window === 'undefined') return;

  // The consent bootstrap defines `gtag` in a `beforeInteractive` script, so it
  // exists before any React handler can run. The queue fallback only matters if
  // that script was blocked, and keeps events from being dropped outright.
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/**
 * Sends one of the declared events. Taking the whole discriminated union as a
 * single object means TypeScript checks the name against its own parameters —
 * passing `cv_download` with contact params is a compile error, not a silent
 * bad row in GA4.
 */
export function trackEvent(event: AnalyticsEvent) {
  push('event', event.name, event.params);
}

/** Explicit page_view, used for client-side navigations. */
export function trackPageView({
  url,
  title,
  locale
}: {
  url: string;
  title: string;
  locale: string;
}) {
  push('event', 'page_view', {
    page_location: url,
    page_title: title,
    // Custom dimension: lets you split every report by site language.
    content_language: locale
  });
}

/** Applies a consent decision to Google Consent Mode v2. */
export function updateConsent(choice: ConsentChoice) {
  push('consent', 'update', {
    analytics_storage: choice,
    // The site runs no advertising, so ad signals stay denied either way.
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
}

export function readStoredConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    // Private mode / blocked storage: treat as "not decided yet".
    return null;
  }
}

export function storeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Non-fatal: the banner will simply ask again next visit.
  }
}
