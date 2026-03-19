const HOROSCOPE_MESSAGES: Record<string, string[]> = {
  Aries: [
    'Momentum is available today. Pick the highest-conviction path and move before doubt adds drag.',
    'A direct conversation clears latent friction. Keep it precise and avoid overstating your position.',
    'You are better served by decisive iteration than extended planning. Ship the first useful version.'
  ],
  Taurus: [
    'Stability compounds today. Small disciplined actions create more leverage than a dramatic pivot.',
    'Protect your attention budget. The useful signal is in what remains consistent, not what is loud.',
    'A practical upgrade improves your environment. Optimize the system you rely on every day.'
  ],
  Gemini: [
    'Your edge is synthesis. Two unrelated threads can be combined into a cleaner answer than either alone.',
    'An incoming message matters more than it first appears. Respond after you have reduced it to first principles.',
    'Curiosity opens a path today, but only if you convert insight into a concrete next action.'
  ],
  Cancer: [
    'Pay attention to your internal baseline. Better boundaries improve both clarity and output quality.',
    'A familiar relationship becomes more useful when you state what you actually need instead of implying it.',
    'Today favors deliberate care over reactive protection. Reinforce what genuinely sustains you.'
  ],
  Leo: [
    'Visibility follows substance today. Lead with the work, and recognition will follow without strain.',
    'Your confidence is most effective when it creates room for others to contribute, not just to admire.',
    'A bold move lands well if it is anchored in preparation rather than performance.'
  ],
  Virgo: [
    'Refinement is the right move today. Remove friction, tighten scope, and let the system breathe.',
    'Precision helps, but perfectionism does not. Define the quality bar explicitly and stop once it is met.',
    'A detail that others ignored turns out to matter. Validate it, document it, and move forward.'
  ],
  Libra: [
    'Alignment matters more than agreement today. Find the configuration that keeps tradeoffs explicit.',
    'A decision becomes easier once aesthetics and utility stop competing. You can satisfy both with better framing.',
    'Social signal is noisy today. Trust the interaction that feels balanced rather than merely flattering.'
  ],
  Scorpio: [
    'Today rewards depth over surface motion. Follow the pattern underneath the first explanation.',
    'Something hidden becomes actionable once you stop forcing disclosure and instead observe incentives.',
    'Your focus is unusually strong today. Use it on the question that others keep avoiding.'
  ],
  Sagittarius: [
    'Exploration is useful today if it stays connected to execution. Expand the map, then choose one route.',
    'A fresh perspective breaks a stale loop. Travel mentally or physically, but return with a concrete insight.',
    'Your optimism is an asset today when paired with verification. Test the exciting idea before scaling it.'
  ],
  Capricorn: [
    'Long-horizon thinking pays off today. Make the decision that still looks correct after the hype decays.',
    'Authority is strongest when it is quiet and consistent. Let disciplined execution speak for you.',
    'A structural fix will outperform another temporary patch. Invest in the durable solution.'
  ],
  Aquarius: [
    'The recurring idea is recurring for a reason. Give it structure and see whether it survives contact with reality.',
    'A conversation introduces a non-obvious opportunity. Stay open, but filter for actual optionality.',
    'Innovation works today when it removes complexity instead of adding novelty for its own sake.'
  ],
  Pisces: [
    'Your intuition is high-signal today, but it still benefits from one hard check against reality.',
    'Creative flow improves once you stop trying to justify it in advance. Start, then evaluate.',
    'Compassion is useful today when it includes yourself. Do not absorb what is not yours to carry.'
  ]
};

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function generateDailyHoroscope(sign: string, date = new Date()): string {
  const messages = HOROSCOPE_MESSAGES[sign] ?? ['Today favors steady progress. Keep your scope tight and your attention clean.'];
  const index = hashString(`${sign}:${getDayKey(date)}`) % messages.length;
  return messages[index];
}
