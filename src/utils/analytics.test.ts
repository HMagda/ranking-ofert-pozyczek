import { describe, it, expect, beforeEach } from 'vitest';
import { logEvent, getEvents, clearEvents } from './analytics';

describe('analytics', () => {
  beforeEach(() => {
    clearEvents();
  });

  it('should log an event to localStorage', () => {
    logEvent('view_list', { count: 5 });

    const events = getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('view_list');
    expect(events[0].params).toEqual({ count: 5 });
    expect(events[0].timestamp).toBeGreaterThan(0);
  });

  it('should log multiple events', () => {
    logEvent('view_list', { count: 5 });
    logEvent('filter_change', { amount: 1000, period: 12 });
    logEvent('cta_click', { offerId: '123', offerName: 'Test', apr: 15.5 });

    const events = getEvents();
    expect(events).toHaveLength(3);
    expect(events[0].name).toBe('view_list');
    expect(events[1].name).toBe('filter_change');
    expect(events[2].name).toBe('cta_click');
  });

  it('should clear all events', () => {
    logEvent('view_list', { count: 5 });
    logEvent('filter_change', { amount: 1000, period: 12 });

    clearEvents();

    const events = getEvents();
    expect(events).toHaveLength(0);
  });

  it('should handle events without parameters', () => {
    logEvent('view_list', { count: 0 });

    const events = getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].params).toBeDefined();
  });

  it('should persist events across multiple getEvents calls', () => {
    logEvent('view_list', { count: 5 });

    const events1 = getEvents();
    const events2 = getEvents();

    expect(events1).toEqual(events2);
  });

  it('should handle CTA click event with complete data', () => {
    logEvent('cta_click', {
      offerId: 'abc123',
      offerName: 'TestOffer',
      apr: 12.5,
    });

    const events = getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('cta_click');
    expect(events[0].params).toEqual({
      offerId: 'abc123',
      offerName: 'TestOffer',
      apr: 12.5,
    });
  });

  it('should handle all event types', () => {
    logEvent('view_list', { count: 10 });
    logEvent('filter_change', { amount: 5000, period: 12 });
    logEvent('sort_change', { sortBy: 'apr-asc' });
    logEvent('expand_offer', { offerId: '1', offerName: 'Offer 1' });
    logEvent('cta_click', { offerId: '1', offerName: 'Offer 1', apr: 15.5 });

    const events = getEvents();
    expect(events).toHaveLength(5);
    expect(events.map((e) => e.name)).toEqual([
      'view_list',
      'filter_change',
      'sort_change',
      'expand_offer',
      'cta_click',
    ]);
  });

  it('should store timestamp for each event', () => {
    const before = Date.now();
    logEvent('view_list', { count: 1 });
    const after = Date.now();

    const events = getEvents();
    expect(events[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(events[0].timestamp).toBeLessThanOrEqual(after);
  });

  it('should maintain chronological order', () => {
    logEvent('view_list', { count: 1 });
    logEvent('filter_change', { amount: 1000, period: 12 });
    logEvent('sort_change', { sortBy: 'apr-asc' });

    const events = getEvents();
    expect(events[0].timestamp).toBeLessThanOrEqual(events[1].timestamp);
    expect(events[1].timestamp).toBeLessThanOrEqual(events[2].timestamp);
  });

  it('should handle rapid event logging', () => {
    for (let i = 0; i < 100; i++) {
      logEvent('view_list', { count: i });
    }

    const events = getEvents();
    expect(events).toHaveLength(100);
  });

  it('should handle filter_change with tags', () => {
    logEvent('filter_change', {
      amount: 5000,
      period: 12,
      tags: ['ratalna', 'online'],
    });

    const events = getEvents();
    expect(events[0].params).toEqual({
      amount: 5000,
      period: 12,
      tags: ['ratalna', 'online'],
    });
  });

  it('should handle filter_change without tags', () => {
    logEvent('filter_change', {
      amount: 5000,
      period: 12,
    });

    const events = getEvents();
    expect(events[0].params).toEqual({
      amount: 5000,
      period: 12,
    });
  });

  it('should handle expand_offer event', () => {
    logEvent('expand_offer', {
      offerId: 'offer-123',
      offerName: 'Test Offer',
    });

    const events = getEvents();
    expect(events[0].params).toEqual({
      offerId: 'offer-123',
      offerName: 'Test Offer',
    });
  });

  it('should handle sort_change event with apr-asc', () => {
    logEvent('sort_change', { sortBy: 'apr-asc' });

    const events = getEvents();
    expect(events[0].params).toEqual({ sortBy: 'apr-asc' });
  });

  it('should handle sort_change event with rating-desc', () => {
    logEvent('sort_change', { sortBy: 'rating-desc' });

    const events = getEvents();
    expect(events[0].params).toEqual({ sortBy: 'rating-desc' });
  });

  it('should return empty array when localStorage is empty', () => {
    clearEvents();
    const events = getEvents();
    expect(events).toEqual([]);
  });

  it('should handle special characters in event params', () => {
    logEvent('cta_click', {
      offerId: 'id-with-special-chars-!@#',
      offerName: 'Name with "quotes" and \'apostrophes\'',
      apr: 15.5,
    });

    const events = getEvents();
    expect(events[0].params).toEqual({
      offerId: 'id-with-special-chars-!@#',
      offerName: 'Name with "quotes" and \'apostrophes\'',
      apr: 15.5,
    });
  });

  it('should handle Unicode characters in event params', () => {
    logEvent('expand_offer', {
      offerId: '123',
      offerName: 'Pożyczka €100-200 zł',
    });

    const events = getEvents();
    expect(events[0].params?.offerName).toBe('Pożyczka €100-200 zł');
  });

  it('should handle very long event param values', () => {
    const longString = 'a'.repeat(1000);
    logEvent('expand_offer', {
      offerId: '123',
      offerName: longString,
    });

    const events = getEvents();
    expect(events[0].params?.offerName).toBe(longString);
  });

  it('should handle decimal APR values in cta_click', () => {
    logEvent('cta_click', {
      offerId: '1',
      offerName: 'Test',
      apr: 15.99999,
    });

    const events = getEvents();
    expect(events[0].params).toEqual({
      offerId: '1',
      offerName: 'Test',
      apr: 15.99999,
    });
  });

  it('should handle zero values in event params', () => {
    logEvent('filter_change', {
      amount: 0,
      period: 0,
    });

    const events = getEvents();
    expect(events[0].params).toEqual({
      amount: 0,
      period: 0,
    });
  });

  it('should handle negative values in event params', () => {
    logEvent('filter_change', {
      amount: -100,
      period: -5,
    });

    const events = getEvents();
    expect(events[0].params).toEqual({
      amount: -100,
      period: -5,
    });
  });

  it('should accumulate events over time', () => {
    logEvent('view_list', { count: 1 });
    expect(getEvents()).toHaveLength(1);

    logEvent('filter_change', { amount: 1000, period: 12 });
    expect(getEvents()).toHaveLength(2);

    logEvent('sort_change', { sortBy: 'apr-asc' });
    expect(getEvents()).toHaveLength(3);
  });

  it('should handle clearing events multiple times', () => {
    logEvent('view_list', { count: 1 });
    clearEvents();
    expect(getEvents()).toHaveLength(0);

    clearEvents();
    expect(getEvents()).toHaveLength(0);

    logEvent('view_list', { count: 2 });
    expect(getEvents()).toHaveLength(1);
  });
});
