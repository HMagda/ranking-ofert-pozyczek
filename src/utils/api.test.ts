import { describe, it, expect } from 'vitest';
import { filterOffers, sortOffers, getAllTags } from './api';
import type { Offer } from '../types';

const mockOffers: Offer[] = [
  {
    id: '1',
    name: 'Test Offer 1',
    logo: 'logo1.png',
    apr: 15.5,
    minAmount: 1000,
    maxAmount: 10000,
    minPeriod: 6,
    maxPeriod: 36,
    decision: 'online',
    tags: ['ratalna', 'online'],
    rating: 85,
  },
  {
    id: '2',
    name: 'Test Offer 2',
    logo: 'logo2.png',
    apr: 89.9,
    minAmount: 200,
    maxAmount: 5000,
    minPeriod: 1,
    maxPeriod: 1,
    decision: 'online',
    tags: ['chwilówka', '30 dni'],
    rating: 70,
  },
  {
    id: '3',
    name: 'Test Offer 3',
    logo: 'logo3.png',
    apr: 12.0,
    minAmount: 1000,
    maxAmount: 50000,
    minPeriod: 12,
    maxPeriod: 60,
    decision: 'do 24h',
    tags: ['ratalna', 'offline'],
    rating: 90,
  },
];

describe('filterOffers', () => {
  it('should filter offers by amount range', () => {
    const result = filterOffers(mockOffers, 3000, 12, []);
    expect(result).toHaveLength(2);
    expect(result.map((o) => o.id)).toEqual(['1', '3']);
  });

  it('should filter offers by period range', () => {
    const result = filterOffers(mockOffers, 1000, 1, []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should filter offers by tags', () => {
    const result = filterOffers(mockOffers, 1000, 1, ['chwilówka']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should filter offers by multiple criteria', () => {
    const result = filterOffers(mockOffers, 3000, 24, ['ratalna']);
    expect(result).toHaveLength(2);
    expect(result.map((o) => o.id)).toEqual(['1', '3']);
  });

  it('should return empty array when no offers match', () => {
    const result = filterOffers(mockOffers, 100000, 1, []);
    expect(result).toHaveLength(0);
  });

  it('should return all offers when no tags selected', () => {
    const result = filterOffers(mockOffers, 5000, 12, []);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should filter at minimum amount boundary', () => {
    const result = filterOffers(mockOffers, 200, 1, []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should filter at maximum amount boundary', () => {
    const result = filterOffers(mockOffers, 50000, 12, []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('should filter at minimum period boundary', () => {
    const result = filterOffers(mockOffers, 1000, 1, []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should filter at maximum period boundary', () => {
    const result = filterOffers(mockOffers, 10000, 60, []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('should handle multiple matching tags', () => {
    const result = filterOffers(mockOffers, 1000, 12, ['ratalna', 'online']);
    expect(result).toHaveLength(2);
    expect(result.map((o) => o.id)).toEqual(['1', '3']);
  });

  it('should filter with tag that matches no offers', () => {
    const result = filterOffers(mockOffers, 1000, 12, ['nonexistent']);
    expect(result).toHaveLength(0);
  });

  it('should handle amount exactly at range boundaries', () => {
    const result = filterOffers(mockOffers, 1000, 12, []);
    expect(result.some((o) => o.id === '1')).toBe(true);
  });

  it('should handle period exactly at range boundaries', () => {
    const result = filterOffers(mockOffers, 5000, 12, []);
    expect(result.some((o) => o.id === '3')).toBe(true);
  });

  it('should handle empty offers array', () => {
    const result = filterOffers([], 1000, 12, []);
    expect(result).toEqual([]);
  });

  it('should filter with very large amount', () => {
    const result = filterOffers(mockOffers, 1000000, 12, []);
    expect(result).toHaveLength(0);
  });

  it('should filter with very large period', () => {
    const result = filterOffers(mockOffers, 10000, 100, []);
    expect(result).toHaveLength(0);
  });
});

describe('sortOffers', () => {
  it('should sort offers by APR ascending', () => {
    const result = sortOffers(mockOffers, 'apr-asc');
    expect(result[0].apr).toBe(12.0);
    expect(result[1].apr).toBe(15.5);
    expect(result[2].apr).toBe(89.9);
  });

  it('should sort offers by rating descending', () => {
    const result = sortOffers(mockOffers, 'rating-desc');
    expect(result[0].rating).toBe(90);
    expect(result[1].rating).toBe(85);
    expect(result[2].rating).toBe(70);
  });

  it('should not mutate original array', () => {
    const original = [...mockOffers];
    sortOffers(mockOffers, 'apr-asc');
    expect(mockOffers).toEqual(original);
  });

  it('should handle empty array', () => {
    const result = sortOffers([], 'apr-asc');
    expect(result).toEqual([]);
  });

  it('should handle single offer', () => {
    const result = sortOffers([mockOffers[0]], 'apr-asc');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockOffers[0]);
  });

  it('should maintain stable sort for equal APR values', () => {
    const sameAPR = mockOffers.map((o) => ({ ...o, apr: 15.0 }));
    const result = sortOffers(sameAPR, 'apr-asc');
    expect(result).toHaveLength(3);
  });

  it('should maintain stable sort for equal rating values', () => {
    const sameRating = mockOffers.map((o) => ({ ...o, rating: 80 }));
    const result = sortOffers(sameRating, 'rating-desc');
    expect(result).toHaveLength(3);
  });

  it('should handle very similar APR values', () => {
    const similarAPR = [
      { ...mockOffers[0], apr: 15.5 },
      { ...mockOffers[1], apr: 15.51 },
      { ...mockOffers[2], apr: 15.49 },
    ];
    const result = sortOffers(similarAPR, 'apr-asc');
    expect(result[0].apr).toBe(15.49);
    expect(result[2].apr).toBe(15.51);
  });

  it('should handle decimal APR values correctly', () => {
    const decimalAPR = [
      { ...mockOffers[0], apr: 15.99 },
      { ...mockOffers[1], apr: 15.1 },
      { ...mockOffers[2], apr: 15.09 },
    ];
    const result = sortOffers(decimalAPR, 'apr-asc');
    expect(result[0].apr).toBe(15.09);
    expect(result[1].apr).toBe(15.1);
    expect(result[2].apr).toBe(15.99);
  });
});

describe('getAllTags', () => {
  it('should extract all unique tags', () => {
    const tags = getAllTags(mockOffers);
    expect(tags).toContain('ratalna');
    expect(tags).toContain('chwilówka');
    expect(tags).toContain('online');
    expect(tags).toContain('offline');
    expect(tags).toContain('30 dni');
  });

  it('should return sorted tags', () => {
    const tags = getAllTags(mockOffers);
    const sortedTags = [...tags].sort();
    expect(tags).toEqual(sortedTags);
  });

  it('should handle empty array', () => {
    const tags = getAllTags([]);
    expect(tags).toEqual([]);
  });

  it('should remove duplicate tags', () => {
    const offersWithDuplicates = [
      { ...mockOffers[0], tags: ['tag1', 'tag2'] },
      { ...mockOffers[1], tags: ['tag1', 'tag3'] },
      { ...mockOffers[2], tags: ['tag2', 'tag3'] },
    ];
    const tags = getAllTags(offersWithDuplicates);
    expect(tags).toEqual(['tag1', 'tag2', 'tag3']);
  });

  it('should handle offers with no tags', () => {
    const offersWithoutTags = mockOffers.map((o) => ({ ...o, tags: [] }));
    const tags = getAllTags(offersWithoutTags);
    expect(tags).toEqual([]);
  });

  it('should handle offers with single tag', () => {
    const singleTagOffers = [{ ...mockOffers[0], tags: ['only-tag'] }];
    const tags = getAllTags(singleTagOffers);
    expect(tags).toEqual(['only-tag']);
  });

  it('should handle mixed empty and filled tag arrays', () => {
    const mixedOffers = [
      { ...mockOffers[0], tags: ['tag1'] },
      { ...mockOffers[1], tags: [] },
      { ...mockOffers[2], tags: ['tag2'] },
    ];
    const tags = getAllTags(mixedOffers);
    expect(tags).toEqual(['tag1', 'tag2']);
  });

  it('should handle tags with special characters', () => {
    const specialTags = [
      { ...mockOffers[0], tags: ['tag-with-dash', 'tag_with_underscore'] },
    ];
    const tags = getAllTags(specialTags);
    expect(tags).toContain('tag-with-dash');
    expect(tags).toContain('tag_with_underscore');
  });

  it('should handle tags with numbers', () => {
    const numberTags = [
      { ...mockOffers[0], tags: ['30 dni', '12 miesięcy', '24h'] },
    ];
    const tags = getAllTags(numberTags);
    expect(tags).toContain('30 dni');
    expect(tags).toContain('12 miesięcy');
    expect(tags).toContain('24h');
  });

  it('should maintain case sensitivity', () => {
    const caseTags = [
      { ...mockOffers[0], tags: ['Tag1', 'tag1', 'TAG1'] },
    ];
    const tags = getAllTags(caseTags);
    expect(tags).toHaveLength(3);
    expect(tags).toContain('Tag1');
    expect(tags).toContain('tag1');
    expect(tags).toContain('TAG1');
  });

  it('should handle very long tag names', () => {
    const longTag = 'very-long-tag-name-that-describes-something-in-detail';
    const longTagOffers = [{ ...mockOffers[0], tags: [longTag] }];
    const tags = getAllTags(longTagOffers);
    expect(tags).toContain(longTag);
  });
});
