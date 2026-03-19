import { FormEvent, useMemo, useRef, useState } from 'react';
import { calculateProfile } from './engine';
import { buildDestinyPrompt, generateDestinyReading, parseDestinyReading } from './grok';
import type { DestinyReadingSection, EngineResult } from './types';

function formatTraitName(trait: string): string {
  return trait
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
}

export default function App() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState<EngineResult | null>(null);
  const [reading, setReading] = useState('');
  const [readingSections, setReadingSections] = useState<DestinyReadingSection[]>([]);
  const [readingError, setReadingError] = useState('');
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const requestIdRef = useRef(0);
  const canSubmit = useMemo(() => Boolean(date), [date]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date) return;

    const profile = calculateProfile({
      name: name.trim() || undefined,
      date,
      time: time || undefined,
      location: location.trim() || undefined
    });

    setResult(profile);
    setReading('');
    setReadingSections([]);
    setReadingError('');

    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;
    setIsReadingLoading(true);

    try {
      const prompt = buildDestinyPrompt({
        name: name.trim() || 'Seeker',
        profile
      });
      const response = await generateDestinyReading(prompt);

      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setReading(response);
      setReadingSections(parseDestinyReading(response));
    } catch (error) {
      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setReadingError(
        error instanceof Error
          ? error.message
          : 'Unable to reach Puter/xAI right now. Profile calculation still completed locally.'
      );
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setIsReadingLoading(false);
      }
    }
  }

  return (
    <main className="app-shell">
      <section className="hero card">
        <div>
          <p className="eyebrow">Destiny Engine + Grok</p>
          <h1>Blended symbolic profile calculator</h1>
          <p className="lede">
            Compute a local symbolic profile, then have Grok synthesize it into a structured destiny
            reading across Western zodiac, Chinese zodiac, element mapping, and numerology.
          </p>
        </div>

        <form className="input-grid" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
          </label>

          <label>
            <span>Birth date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          <label>
            <span>Birth time</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>

          <label>
            <span>Location</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional" />
          </label>

          <button type="submit" disabled={!canSubmit || isReadingLoading}>
            {isReadingLoading ? 'Generating destiny reading…' : 'Calculate profile'}
          </button>
        </form>
      </section>

      {result && (
        <section className="results">
          <article className="card summary-card">
            <div className="summary-header">
              <div>
                <p className="eyebrow">Profile result</p>
                <h2>{name.trim() ? `${name.trim()}'s profile` : 'Your symbolic profile'}</h2>
              </div>
              <div className="pill-row">
                <span className="pill">{result.westernSign}</span>
                <span className="pill">{result.chineseElement} {result.chineseAnimal}</span>
                <span className="pill">Life Path {result.numerologyLifePath}</span>
              </div>
            </div>
            <p className="lede">{result.summary}</p>
            <details className="prompt-details">
              <summary>Prompt payload sent to Grok</summary>
              <pre>{buildDestinyPrompt({ name: name.trim() || 'Seeker', profile: result })}</pre>
            </details>
          </article>

          <article className="card reading-card">
            <div className="summary-header">
              <div>
                <p className="eyebrow">AI synthesis</p>
                <h3>Destiny reading</h3>
              </div>
              {isReadingLoading && <span className="pill status-pill">Contacting Grok via Puter.js</span>}
            </div>

            {readingError && <p className="error-text">{readingError}</p>}

            {!readingError && isReadingLoading && (
              <p className="lede">
                Grok is synthesizing the computed symbolic profile into a five-part reading.
              </p>
            )}

            {!isReadingLoading && readingSections.length > 0 && (
              <div className="reading-sections">
                {readingSections.map((section) => (
                  <section key={section.title} className="reading-section">
                    <h4>{section.title}</h4>
                    <p>{section.body}</p>
                  </section>
                ))}
              </div>
            )}

            {!isReadingLoading && !readingError && !readingSections.length && reading && (
              <pre className="reading-raw">{reading}</pre>
            )}
          </article>

          <div className="stats-grid">
            <article className="card">
              <h3>Top traits</h3>
              <ul className="trait-list">
                {result.topTraits.map((item) => (
                  <li key={`top-${item.trait}`}>
                    <span>{formatTraitName(item.trait)}</span>
                    <strong>{item.score}</strong>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card">
              <h3>Lower traits</h3>
              <ul className="trait-list">
                {result.lowTraits.map((item) => (
                  <li key={`low-${item.trait}`}>
                    <span>{formatTraitName(item.trait)}</span>
                    <strong>{item.score}</strong>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      )}
    </main>
  );
}
