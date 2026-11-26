/**
 * Privacy-First Analytics Module — Zizo Surrogacy
 * Strictly excludes PII (names, phone numbers, health data, chat text).
 */

export type AnalyticsAudience = 'intended_parent' | 'surrogate' | 'egg_donation' | 'general';

export type AnalyticsEvent =
  | { name: 'booking_cta_click'; location: string; audience?: AnalyticsAudience }
  | { name: 'booking_flow_start'; audience: AnalyticsAudience }
  | { name: 'booking_slot_selected'; format: string }
  | { name: 'booking_confirmed'; audience: AnalyticsAudience }
  | { name: 'booking_error'; errorType: string }
  | { name: 'whatsapp_click'; location: string; audience: AnalyticsAudience }
  | { name: 'insight_read'; slug: string };

export function trackEvent(event: AnalyticsEvent) {
  // In development, log safe structured event
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info('[Zizo Analytics Event]', event);
  }

  // Window custom event dispatcher for Plausible / GA4 / PostHog
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zizo:track', { detail: event }));

    // Support window.dataLayer if present
    const customWindow = window as unknown as { dataLayer?: Record<string, unknown>[] };
    if (Array.isArray(customWindow.dataLayer)) {
      customWindow.dataLayer.push({
        event: event.name,
        ...event,
      });
    }
  }
}
