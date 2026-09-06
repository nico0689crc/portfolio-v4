import Script from 'next/script';
import { CONSENT_STORAGE_KEY } from '@/lib/analytics';

/**
 * Google Consent Mode v2 bootstrap.
 *
 * Must execute before gtag.js processes any command, so it runs with
 * `beforeInteractive`. It denies every storage type up front and immediately
 * re-grants analytics for returning visitors who already accepted — doing that
 * here rather than after hydration means their first page_view isn't lost.
 *
 * `wait_for_update` holds tags briefly so a consent decision made right away
 * still applies to the initial hit.
 */
export function ConsentInit() {
  const html = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
try {
  if (window.localStorage.getItem('${CONSENT_STORAGE_KEY}') === 'granted') {
    gtag('consent', 'update', { analytics_storage: 'granted' });
  }
} catch (e) {}
gtag('js', new Date());`;

  return (
    // The rule targets the Pages Router; in App Router `beforeInteractive` is
    // valid from the root layout and lands in Next's pre-hydration queue.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      id="consent-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
