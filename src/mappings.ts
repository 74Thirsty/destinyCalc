import type { TraitScores } from './types';

export const WESTERN_SIGN_TRAITS: Record<string, TraitScores> = {
  Aries: { leadership: 5, courage: 4, impulsivity: 3, independence: 4 },
  Taurus: { stability: 5, loyalty: 4, patience: 4, stubbornness: 3 },
  Gemini: { communication: 5, curiosity: 5, adaptability: 4, focus: -1 },
  Cancer: { empathy: 5, intuition: 4, protectiveness: 4, sensitivity: 3 },
  Leo: { confidence: 5, creativity: 4, charisma: 4, pride: 2 },
  Virgo: { analysis: 5, discipline: 4, service: 4, worry: 2 },
  Libra: { harmony: 5, diplomacy: 4, charm: 4, indecision: 2 },
  Scorpio: { intensity: 5, strategy: 4, loyalty: 4, secrecy: 3 },
  Sagittarius: { adventure: 5, optimism: 4, honesty: 4, restlessness: 2 },
  Capricorn: { ambition: 5, discipline: 5, practicality: 4, rigidity: 2 },
  Aquarius: { originality: 5, independence: 4, vision: 4, detachment: 2 },
  Pisces: { imagination: 5, empathy: 4, spirituality: 4, escapism: 2 }
};

export const CHINESE_ANIMAL_TRAITS: Record<string, TraitScores> = {
  Rat: { intelligence: 4, adaptability: 4, resourcefulness: 5, caution: 2 },
  Ox: { discipline: 5, loyalty: 4, endurance: 5, stubbornness: 2 },
  Tiger: { courage: 5, charisma: 4, competitiveness: 4, impulsivity: 2 },
  Rabbit: { diplomacy: 4, kindness: 5, elegance: 3, caution: 2 },
  Dragon: { ambition: 5, confidence: 5, magnetism: 4, intensity: 2 },
  Snake: { strategy: 5, intuition: 4, privacy: 4, patience: 3 },
  Horse: { freedom: 5, energy: 4, sociability: 4, restlessness: 2 },
  Goat: { empathy: 5, creativity: 5, gentleness: 4, sensitivity: 3 },
  Monkey: { cleverness: 5, humor: 4, adaptability: 4, inconsistency: 2 },
  Rooster: { precision: 5, confidence: 4, honesty: 4, criticism: 2 },
  Dog: { loyalty: 5, justice: 4, protectiveness: 4, anxiety: 2 },
  Pig: { generosity: 5, warmth: 4, sincerity: 4, indulgence: 2 }
};

export const ELEMENT_TRAITS: Record<string, TraitScores> = {
  Wood: { growth: 4, creativity: 3, idealism: 2 },
  Fire: { passion: 5, charisma: 4, impulsivity: 2 },
  Earth: { stability: 5, practicality: 4, reliability: 4 },
  Metal: { discipline: 5, precision: 4, resilience: 4 },
  Water: { intuition: 5, adaptability: 4, reflection: 4 }
};

export const NUMEROLOGY_TRAITS: Record<number, TraitScores> = {
  1: { leadership: 5, independence: 5, initiative: 4 },
  2: { diplomacy: 5, sensitivity: 4, cooperation: 5 },
  3: { creativity: 5, expression: 5, optimism: 4 },
  4: { discipline: 5, structure: 5, reliability: 4 },
  5: { freedom: 5, adaptability: 5, adventure: 4 },
  6: { responsibility: 5, care: 5, loyalty: 4 },
  7: { analysis: 5, spirituality: 4, introspection: 5 },
  8: { ambition: 5, authority: 4, achievement: 5 },
  9: { compassion: 5, idealism: 4, generosity: 5 },
  11: { intuition: 5, inspiration: 5, sensitivity: 4 },
  22: { mastery: 5, execution: 5, vision: 4 },
  33: { healing: 5, compassion: 5, service: 5 }
};
