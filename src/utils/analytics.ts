import type { AnalyticsEvent, EventName, EventParams } from '../types';

const STORAGE_KEY = 'youmoney_analytics_events';

export function logEvent<T extends EventName>(
  name: T,
  params?: EventParams[T]
): void {
  try {
    const event: AnalyticsEvent = {
      name,
      timestamp: Date.now(),
      params: params as Record<string, unknown>,
    };

    const existingEvents = getEvents();
    existingEvents.push(event);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingEvents));

    if (import.meta.env.DEV) {
      console.log('[Analytics]', name, params);
    }
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

export function getEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve events:', error);
    return [];
  }
}

export function clearEvents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear events:', error);
  }
}
