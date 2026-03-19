import type { BirthInput, EngineResult, TraitScores } from './types';
import {
  WESTERN_SIGN_TRAITS,
  CHINESE_ANIMAL_TRAITS,
  ELEMENT_TRAITS,
  NUMEROLOGY_TRAITS
} from './mappings';

const CHINESE_ANIMALS = [
  'Rat',
  'Ox',
  'Tiger',
  'Rabbit',
  'Dragon',
  'Snake',
  'Horse',
  'Goat',
  'Monkey',
  'Rooster',
  'Dog',
  'Pig'
] as const;

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;

const CHINESE_NEW_YEAR: Record<number, string> = {
  1978: '1978-02-07',
  1979: '1979-01-28',
  1980: '1980-02-16',
  1981: '1981-02-05',
  1982: '1982-01-25',
  1983: '1983-02-13',
  1984: '1984-02-02',
  1985: '1985-02-20',
  1986: '1986-02-09',
  1987: '1987-01-29',
  1988: '1988-02-17',
  1989: '1989-02-06',
  1990: '1990-01-27',
  1991: '1991-02-15',
  1992: '1992-02-04',
  1993: '1993-01-23',
  1994: '1994-02-10',
  1995: '1995-01-31',
  1996: '1996-02-19',
  1997: '1997-02-07',
  1998: '1998-01-28',
  1999: '1999-02-16',
  2000: '2000-02-05',
  2001: '2001-01-24',
  2002: '2002-02-12',
  2003: '2003-02-01',
  2004: '2004-01-22',
  2005: '2005-02-09',
  2006: '2006-01-29',
  2007: '2007-02-18',
  2008: '2008-02-07',
  2009: '2009-01-26',
  2010: '2010-02-14',
  2011: '2011-02-03',
  2012: '2012-01-23',
  2013: '2013-02-10',
  2014: '2014-01-31',
  2015: '2015-02-19',
  2016: '2016-02-08',
  2017: '2017-01-28',
  2018: '2018-02-16',
  2019: '2019-02-05',
  2020: '2020-01-25',
  2021: '2021-02-12',
  2022: '2022-02-01',
  2023: '2023-01-22',
  2024: '2024-02-10',
  2025: '2025-01-29',
  2026: '2026-02-17',
  2027: '2027-02-06',
  2028: '2028-01-26',
  2029: '2029-02-13',
  2030: '2030-02-03',
  2031: '2031-01-23',
  2032: '2032-02-11',
  2033: '2033-01-31',
  2034: '2034-02-19',
  2035: '2035-02-08'
};

function parseDateOnly(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

export function getWesternSign(dateStr: string): string {
  const d = parseDateOnly(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

export function getChineseYearAdjusted(dateStr: string): number {
  const d = parseDateOnly(dateStr);
  const year = d.getFullYear();
  const cny = CHINESE_NEW_YEAR[year];

  if (!cny) {
    return year;
  }

  return d < parseDateOnly(cny) ? year - 1 : year;
}

export function getChineseAnimal(dateStr: string): string {
  const year = getChineseYearAdjusted(dateStr);
  const index = (year - 4 + 1200) % 12;
  return CHINESE_ANIMALS[index];
}

export function getChineseElement(dateStr: string): string {
  const year = getChineseYearAdjusted(dateStr);
  const stemIndex = (year - 4 + 600) % 10;

  if (stemIndex === 0 || stemIndex === 1) return ELEMENTS[0];
  if (stemIndex === 2 || stemIndex === 3) return ELEMENTS[1];
  if (stemIndex === 4 || stemIndex === 5) return ELEMENTS[2];
  if (stemIndex === 6 || stemIndex === 7) return ELEMENTS[3];
  return ELEMENTS[4];
}

export function getLifePath(dateStr: string): number {
  const digits = dateStr.replaceAll('-', '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);

  while (![11, 22, 33].includes(sum) && sum > 9) {
    sum = String(sum)
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }

  return sum;
}

function mergeTraitMaps(...maps: TraitScores[]): TraitScores {
  const result: TraitScores = {};

  for (const map of maps) {
    for (const [trait, value] of Object.entries(map)) {
      result[trait] = (result[trait] ?? 0) + value;
    }
  }

  return result;
}

function sortTraits(traits: TraitScores) {
  return Object.entries(traits)
    .map(([trait, score]) => ({ trait, score }))
    .sort((a, b) => b.score - a.score || a.trait.localeCompare(b.trait));
}

function formatTraitName(trait: string): string {
  return trait
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
}

function buildSummary(
  westernSign: string,
  chineseAnimal: string,
  chineseElement: string,
  lifePath: number,
  topTraits: Array<{ trait: string; score: number }>
): string {
  const top = topTraits
    .slice(0, 4)
    .map((t) => formatTraitName(t.trait))
    .join(', ');

  return `${westernSign} + ${chineseElement} ${chineseAnimal} + Life Path ${lifePath} suggests strong themes around ${top}. This profile blends symbolic communication style, instinct pattern, and motivational drive into one result.`;
}

export function calculateProfile(input: BirthInput): EngineResult {
  const westernSign = getWesternSign(input.date);
  const chineseAnimal = getChineseAnimal(input.date);
  const chineseElement = getChineseElement(input.date);
  const numerologyLifePath = getLifePath(input.date);

  const westernTraits = WESTERN_SIGN_TRAITS[westernSign] ?? {};
  const chineseTraits = CHINESE_ANIMAL_TRAITS[chineseAnimal] ?? {};
  const elementTraits = ELEMENT_TRAITS[chineseElement] ?? {};
  const numerologyTraits = NUMEROLOGY_TRAITS[numerologyLifePath] ?? {};

  const traits = mergeTraitMaps(westernTraits, chineseTraits, elementTraits, numerologyTraits);
  const sorted = sortTraits(traits);

  return {
    westernSign,
    chineseAnimal,
    chineseElement,
    numerologyLifePath,
    traits,
    topTraits: sorted.slice(0, 5),
    lowTraits: [...sorted].reverse().slice(0, 5),
    summary: buildSummary(westernSign, chineseAnimal, chineseElement, numerologyLifePath, sorted)
  };
}
