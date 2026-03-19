import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { calculateProfile } from './engine';
import { buildDestinyPrompt, generateDestinyReading, parseDestinyReading } from './grok';
import { generateDailyHoroscope } from './horoscope';
import { renderMarkdown } from './markdown';
import type { DestinyReadingSection, EngineResult } from './types';

function formatTraitName(trait: string): string {
  return trait
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
}

function getPromptName(name: string): string {
  const normalized = name.trim();
  return normalized || 'Unknown';
}

function buildReadingMarkdown(reading: string, sections: DestinyReadingSection[]): string {
  if (reading.trim()) {
    return reading;
  }

  if (!sections.length) {
    return '';
  }

  return sections.map((section) => `## ${section.title}\n\n${section.body}`).join('\n\n');
}

function exportReadingAsPdf(element: HTMLElement | null): void {
  if (!element) {
    return;
  }

  const popup = globalThis.window.open('', '_blank', 'noopener,noreferrer,width=960,height=1200');

  if (!popup) {
    globalThis.window.alert('Unable to open the print preview window. Check the browser popup policy and retry.');
    return;
  }

  popup.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>destiny-reading</title>
        <style>
          body {
            margin: 0;
            padding: 32px;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #111827;
            background: #ffffff;
            line-height: 1.65;
          }

          h1, h2, h3, h4 {
            color: #312e81;
            margin: 0 0 12px;
          }

          p, ul, pre {
            margin: 0 0 16px;
          }

          ul {
            padding-left: 20px;
          }

          code {
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            background: #eef2ff;
            padding: 0.15rem 0.35rem;
            border-radius: 6px;
          }

          pre {
            white-space: pre-wrap;
            word-break: break-word;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 16px;
            padding: 16px;
          }

          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();

  globalThis.setTimeout(() => {
    popup.print();
    popup.close();
  }, 250);
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
  const [horoscope, setHoroscope] = useState('');
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const requestIdRef = useRef(0);
  const readingRef = useRef<HTMLDivElement | null>(null);
  const canSubmit = useMemo(() => Boolean(date), [date]);
  const promptName = getPromptName(name);
  const readingMarkdown = useMemo(() => buildReadingMarkdown(reading, readingSections), [reading, readingSections]);
  const renderedReading = useMemo(() => renderMarkdown(readingMarkdown), [readingMarkdown]);

  useEffect(() => {
    if (!result) {
      setHoroscope('');
      return;
    }

    setHoroscope(generateDailyHoroscope(result.westernSign));
  }, [result]);

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
      const response = await generateDestinyReading({
        name: getPromptName(name),
        profile
      });

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

  function handleHoroscopeRefresh(): void {
    if (!result) {
      return;
    }

    setHoroscope(generateDailyHoroscope(result.westernSign));
  }

  return (
    <main className="app-shell">
      <section className="hero card">
        <div>
          <p className="eyebrow">Destiny Engine + Grok</p>
          <h1>Blended symbolic profile calculator</h1>
          <p className="lede">
            Compute the symbolic profile locally, then pass the derived western sign, Chinese sign,
            element, life path, and trait map into Grok using the exact destiny prompt template.
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
              <summary>Exact prompt sent to Grok</summary>
              <pre>{buildDestinyPrompt({ name: promptName, profile: result })}</pre>
            </details>
          </article>

          <article className="card reading-card">
            <div className="summary-header reading-header-row">
              <div>
                <p className="eyebrow">AI synthesis</p>
                <h3>Destiny reading</h3>
              </div>
              <div className="reading-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => exportReadingAsPdf(readingRef.current)}
                  disabled={!renderedReading}
                >
                  Export PDF
                </button>
                {isReadingLoading && <span className="pill status-pill">Waiting for Puter + Grok</span>}
              </div>
            </div>

            {readingError && <p className="error-text">{readingError}</p>}

            {!readingError && isReadingLoading && (
              <p className="lede">
                Sending the exact custom prompt plus the computed symbolic profile to Grok.
              </p>
            )}

            {!isReadingLoading && renderedReading && (
              <div
                id="markdown-output"
                ref={readingRef}
                className="markdown-output"
                dangerouslySetInnerHTML={{ __html: renderedReading }}
              />
            )}

            {!isReadingLoading && !readingError && !renderedReading && reading && (
              <pre className="reading-raw">{reading}</pre>
            )}
          </article>

          <article className="card horoscope-card">
            <div className="summary-header reading-header-row">
              <div>
                <p className="eyebrow">Daily signal</p>
                <h3>Horoscope</h3>
              </div>
              <button type="button" className="secondary-button" onClick={handleHoroscopeRefresh}>
                Get Today&apos;s Horoscope
              </button>
            </div>
            <div id="horoscope-output" className="horoscope-output">
              <p>{horoscope}</p>
            </div>
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
