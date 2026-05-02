import { describe, expect, it } from 'vitest';
import { rectsOverlap, clamp, lerp, easeOutQuad, isOverGap } from '../www/js/utils.js';

describe('utils', () => {
  it('rectsOverlap detects intersection', () => {
    expect(rectsOverlap(0, 0, 10, 10, 5, 5, 10, 10)).toBe(true);
    expect(rectsOverlap(0, 0, 10, 10, 20, 20, 10, 10)).toBe(false);
  });

  it('clamp bounds values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it('lerp interpolates', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it('easeOutQuad endpoints', () => {
    expect(easeOutQuad(0)).toBe(0);
    expect(easeOutQuad(1)).toBe(1);
  });

  it('isOverGap', () => {
    const gaps = [{ x: 100, w: 50 }];
    expect(isOverGap(120, 10, gaps)).toBe(true);
    expect(isOverGap(0, 10, gaps)).toBe(false);
    expect(isOverGap(0, 10, undefined)).toBe(false);
  });
});
