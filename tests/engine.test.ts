import { describe, expect, it } from 'vitest';
import {
  calculateProfile,
  getChineseAnimal,
  getChineseElement,
  getLifePath,
  getWesternSign
} from '../src/engine';

describe('engine calculations', () => {
  it('calculates 1979-06-01 correctly', () => {
    expect(getWesternSign('1979-06-01')).toBe('Gemini');
    expect(getChineseAnimal('1979-06-01')).toBe('Goat');
    expect(getChineseElement('1979-06-01')).toBe('Earth');
    expect(getLifePath('1979-06-01')).toBe(33);
  });

  it('calculates 1989-06-01 correctly', () => {
    expect(getWesternSign('1989-06-01')).toBe('Gemini');
    expect(getChineseAnimal('1989-06-01')).toBe('Snake');
    expect(getChineseElement('1989-06-01')).toBe('Earth');
    expect(getLifePath('1989-06-01')).toBe(7);
  });

  it('adjusts Chinese zodiac before Chinese New Year', () => {
    expect(getChineseAnimal('1979-01-20')).toBe('Horse');
  });

  it('returns a blended profile object', () => {
    const result = calculateProfile({ date: '1989-06-01', name: 'Test' });
    expect(result.westernSign).toBe('Gemini');
    expect(result.chineseAnimal).toBe('Snake');
    expect(result.topTraits.length).toBe(5);
    expect(result.summary).toContain('Life Path 7');
  });
});
