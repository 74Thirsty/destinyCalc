import { describe, expect, it, vi } from 'vitest';
import { buildDestinyPrompt, generateDestinyReading, parseDestinyReading } from './grok';
import type { EngineResult, PuterClient } from './types';

const profile: EngineResult = {
  westernSign: 'Aquarius',
  chineseAnimal: 'Dragon',
  chineseElement: 'Wood',
  numerologyLifePath: 11,
  traits: {
    originality: 5,
    vision: 4,
    confidence: 5,
    intuition: 5,
    sensitivity: 4
  },
  topTraits: [
    { trait: 'originality', score: 5 },
    { trait: 'confidence', score: 5 }
  ],
  lowTraits: [{ trait: 'sensitivity', score: 4 }],
  summary: 'Sample summary'
};

describe('grok integration helpers', () => {
  it('builds the exact custom prompt template with substituted values', () => {
    const prompt = buildDestinyPrompt({ name: 'Avery', profile });

    expect(prompt).toContain('You are an expert symbolic interpreter who blends Western astrology, Chinese zodiac, numerology, and personality trait analysis into a unified destiny reading.');
    expect(prompt).toContain('Name: Avery');
    expect(prompt).toContain('Western Zodiac: Aquarius');
    expect(prompt).toContain('Chinese Zodiac: Dragon');
    expect(prompt).toContain('Element: Wood');
    expect(prompt).toContain('Life Path Number: 11');
    expect(prompt).toContain('Trait Scores (0–10, negatives allowed): {"originality":5,"vision":4,"confidence":5,"intuition":5,"sensitivity":4}');
    expect(prompt).toContain('2. Explain the person’s core personality themes.');
    expect(prompt).toContain('- Section 5: Closing Insight');
  });

  it('waits for Puter and returns the reading content', async () => {
    const chat = vi.fn().mockResolvedValue({
      message: {
        content: 'Section 1: Core Identity\nSignal-rich and future-facing.'
      }
    });

    globalThis.puter = {
      ai: {
        chat
      }
    } satisfies PuterClient;

    await expect(generateDestinyReading({ name: 'Avery', profile })).resolves.toContain('Core Identity');
    expect(chat).toHaveBeenCalledTimes(1);
    expect(chat.mock.calls[0]?.[0]).toContain('Name: Avery');
    expect(chat.mock.calls[0]?.[1]).toMatchObject({ model: 'x-ai/grok-4.20-beta' });
  });

  it('parses sectioned Grok output into structured sections', () => {
    const reading = `Section 1: Core Identity\nInnovative but emotionally porous.\n\nSection 2: Strengths\nFast synthesis and conviction.\n\nSection 3: Challenges or Shadow Patterns\nCan over-identify with vision.\n\nSection 4: Destiny Themes and Life Path Influence\nBuild signal from intuition.\n\nSection 5: Closing Insight\nPrecision matters.`;

    const sections = parseDestinyReading(reading);

    expect(sections).toHaveLength(5);
    expect(sections[0]).toEqual({
      title: 'Core Identity',
      body: 'Innovative but emotionally porous.',
      content: 'Innovative but emotionally porous.'
    });
    expect(sections[4]?.title).toBe('Closing Insight');
  });
});
