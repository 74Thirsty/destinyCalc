import type { DestinyReadingInput, DestinyReadingSection, PuterChatResponse, PuterClient } from './types';

const DESTINY_MODEL = 'x-ai/grok-4.20-beta';
const PUTER_READY_TIMEOUT_MS = 10_000;
const PUTER_POLL_INTERVAL_MS = 100;
const SECTION_TITLES = [
  'Core Identity',
  'Strengths',
  'Challenges or Shadow Patterns',
  'Destiny Themes and Life Path Influence',
  'Closing Insight',
  'Daily Horoscope'
] as const;

const DESTINY_PROMPT_TEMPLATE = `You are Destiny Calculator, a clairvoyant medium. You receive numerical and symbolic results from the app and interpret them as messages from Western astrology, Chinese zodiac, numerology, and personality trait analysis into a unified destiny reading.

Use the following profile data to create a cohesive, insightful interpretation:

Name: {{name}}
Today: {{today}}
Western Zodiac: {{western_sign}}
Chinese Zodiac: {{chinese_sign}}
Element: {{element}}
Life Path Number: {{life_path}}
Trait Scores (0–10, negatives allowed): {{traits_json}}

Your task:
1. Synthesize all systems into a single, unified reading.
2. Explain the person’s core personality themes.
3. Highlight strengths, challenges, and internal conflicts.
4. Describe how the Western sign, Chinese sign, and Life Path number interact.
5. Interpret the trait scores and show how they shape behavior.
6. Provide practical guidance or life themes based on the combined symbolism.
7. Speak as an intuitive seer, explaining what these results reveal about the user’s destiny, path, and potential future. Be mystical but clear, specific, and grounded—no generic platitudes. Always tie your interpretations directly back to the results you’re given.
8. End with a richer daily horoscope for {{today}} that is specifically grounded in the western sign and the full symbolic profile. Make it feel current, concrete, and directional rather than generic.

Tone:
- Insightful, mystical, prophetic.
- Avoid clichés.
- Make the reading feel personal and specific to the data.
- The daily horoscope should be 2-4 sentences with a clear emotional/weather pattern, one likely opportunity, and one practical caution.

Output Format:
- Section 1: Explanation of the numbers and symbols in the profile, synthesizing all systems into a cohesive interpretation of core identity and destiny themes.
- Section 2: Prophetic insight and forecast for {{today}} that ties into the users destiny in life.
- Section 3: Prophetic Destiny Horoscope
- Section 4: Lucky Numbers (5 numbers between 1 and 70 in one set, 4 numbers from 0-9, and 3 numbers from 0-9) that are auspicious for the user today based on their profile.`;

function serializeTraits(traits: DestinyReadingInput['profile']['traits']): string {
  return JSON.stringify(traits);
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((output, [key, value]) => {
    return output.replaceAll(`{{${key}}}`, value);
  }, template);
}

function getCurrentDateLabel(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function buildDestinyPrompt({ name, profile }: DestinyReadingInput): string {
  return fillTemplate(DESTINY_PROMPT_TEMPLATE, {
    name,
    today: getCurrentDateLabel(),
    western_sign: profile.westernSign,
    chinese_sign: profile.chineseAnimal,
    element: profile.chineseElement,
    life_path: String(profile.numerologyLifePath),
    traits_json: serializeTraits(profile.traits)
  });
}

function readPuterClient(): PuterClient | null {
  const puter = globalThis.window?.puter ?? globalThis.puter;

  if (!puter?.ai?.chat) {
    return null;
  }

  return puter as PuterClient;
}

async function waitForPuterClient(timeoutMs = PUTER_READY_TIMEOUT_MS): Promise<PuterClient> {
  const client = readPuterClient();

  if (client) {
    return client;
  }

  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => globalThis.setTimeout(resolve, PUTER_POLL_INTERVAL_MS));
    const nextClient = readPuterClient();

    if (nextClient) {
      return nextClient;
    }
  }

  throw new Error('Puter.js did not initialize before timeout. Verify https://js.puter.com/v2/ loaded successfully.');
}

export async function generateDestinyReading(input: DestinyReadingInput): Promise<string> {
  const puter = await waitForPuterClient();
  const response = (await puter.ai.chat(buildDestinyPrompt(input), {
    model: DESTINY_MODEL,
    temperature: 0.8,
    max_tokens: 900
  })) as PuterChatResponse;

  const content = response?.message?.content?.trim();

  if (!content) {
    throw new Error('Grok returned an empty reading.');
  }

  return content;
}

export function parseDestinyReading(reading: string): DestinyReadingSection[] {
  const normalized = reading.replace(/\r\n/g, '\n').trim();

  if (!normalized) {
    return [];
  }

  const lines = normalized.split('\n');
  const sections: DestinyReadingSection[] = [];
  let currentTitle: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    if (!currentTitle) {
      return;
    }

    const body = currentBody.join('\n').trim().replace(/^[-:\s]+/, '');

    if (body) {
      sections.push({
        title: currentTitle,
        body
      });
    }
  };

  for (const line of lines) {
    const heading = isRecognizedSectionHeading(line);

    if (heading) {
      flush();
      currentTitle = heading;
      currentBody = [];
      continue;
    }

    if (currentTitle) {
      currentBody.push(line);
    }
  }

  flush();
  return sections;
}
function isRecognizedSectionHeading(line: string): string | null {
  const trimmed = line.trim();
  for (const title of SECTION_TITLES) {
    if (
      trimmed === title ||
      trimmed.startsWith(title + ':') ||
      trimmed.startsWith(title + ' -') ||
      trimmed.startsWith(title + ' —')
    ) {
      return title;
    }
  }
  return null;
}

