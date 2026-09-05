'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Cookie } from 'lucide-react';
import {
  readStoredConsent,
  storeConsent,
  updateConsent,
  type ConsentChoice
} from '@/lib/analytics';

// The stored choice never changes underneath us within a page life, so the
// subscription is a no-op; useSyncExternalStore is used purely to read external
// state with a distinct server snapshot.
const subscribe = () => () => {};

/**
 * Consent banner backing Google Consent Mode v2.
 *
 * Visibility depends on localStorage, which the server can't see. The server
 * snapshot reports "already decided" so the banner is absent from the HTML and
 * appears only once the client confirms no choice was stored — consistent
 * hydration, with no setState inside an effect.
 */
export function CookieConsent() {
  const t = useTranslations('Consent');
  const [dismissed, setDismissed] = useState(false);

  const storedConsent = useSyncExternalStore(
    subscribe,
    useCallback(() => readStoredConsent(), []),
    () => 'denied' as ConsentChoice
  );

  function decide(choice: ConsentChoice) {
    storeConsent(choice);
    updateConsent(choice);
    setDismissed(true);
  }

  if (dismissed || storedConsent !== null) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('title')}
      className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-6 animate-in slide-in-from-bottom duration-500"
    >
      <div className="container mx-auto max-w-3xl rounded-2xl border border-border bg-card shadow-lg p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="hidden sm:flex w-11 h-11 shrink-0 rounded-lg bg-accent/10 items-center justify-center">
          <Cookie className="w-5 h-5 text-accent" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-foreground mb-1">{t('title')}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t('description')}</p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => decide('denied')}
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors duration-200 cursor-pointer"
          >
            {t('reject')}
          </button>
          <button
            type="button"
            onClick={() => decide('granted')}
            className="px-5 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity duration-200 cursor-pointer"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
