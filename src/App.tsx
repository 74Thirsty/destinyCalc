import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { calculateProfile } from './engine';
import { downloadReadingPdf } from './exportPdf';
import { buildDestinyPrompt, generateDestinyReading, parseDestinyReading } from './grok';
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

function buildReadingMarkdown(sections: DestinyReadingSection[], fallbackReading: string): string {
  if (sections.length) {
    return sections.map((section) => `## ${section.title}\n\n${section.body}`).join('\n\n');
  }

  return fallbackReading.trim();
}

function findHoroscopeSection(sections: DestinyReadingSection[]): DestinyReadingSection | null {
  return sections.find((section) => section.title.toLowerCase() === 'daily horoscope') ?? null;
}

function sanitizeFilenameSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'destiny-reading';
}

function buildSpeechText(name: string, summary: string, sections: DestinyReadingSection[], horoscope: DestinyReadingSection | null): string {
  const sectionText = sections
    .map((section) => `${section.title}. ${section.body.replace(/\s+/g, ' ').trim()}`)
    .join(' ');
  const horoscopeText = horoscope ? `Daily Horoscope. ${horoscope.body.replace(/\s+/g, ' ').trim()}` : '';

  return [name ? `${name}'s symbolic profile.` : 'Your symbolic profile.', summary, sectionText, horoscopeText]
    .filter(Boolean)
    .join(' ');
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
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('');
  const [speechRate, setSpeechRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const requestIdRef = useRef(0);
  const canSubmit = useMemo(() => Boolean(date), [date]);
  const promptName = getPromptName(name);
  const horoscopeSection = useMemo(() => findHoroscopeSection(readingSections), [readingSections]);
  const nonHoroscopeSections = useMemo(
    () => readingSections.filter((section) => section.title.toLowerCase() !== 'daily horoscope'),
    [readingSections]
  );
  const readingMarkdown = useMemo(
    () => buildReadingMarkdown(nonHoroscopeSections, readingSections.length ? '' : reading),
    [nonHoroscopeSections, readingSections.length, reading]
  );
  const renderedReading = useMemo(() => renderMarkdown(readingMarkdown), [readingMarkdown]);
  const renderedHoroscope = useMemo(() => renderMarkdown(horoscopeSection?.body ?? ''), [horoscopeSection]);
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const speechText = useMemo(
    () => (result ? buildSpeechText(name.trim(), result.summary, nonHoroscopeSections, horoscopeSection) : ''),
    [horoscopeSection, name, nonHoroscopeSections, result]
  );

  useEffect(() => {
    if (!speechSupported) {
      return undefined;
    }

    const syncVoices = () => {
      const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('en'));
      setAvailableVoices(voices);
      setSelectedVoiceUri((current) => current || voices[0]?.voiceURI || '');
    };

    syncVoices();
    window.speechSynthesis.addEventListener('voiceschanged', syncVoices);

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener('voiceschanged', syncVoices);
    };
  }, [speechSupported]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date) return;

    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

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
    setSpeechError('');

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

  function handlePdfExport(): void {
    if (!result || !renderedReading) {
      return;
    }

    const sectionsForPdf = [
      {
        title: 'Profile Summary',
        body: result.summary
      },
      ...nonHoroscopeSections,
      ...(horoscopeSection ? [horoscopeSection] : [])
    ];

    downloadReadingPdf({
      filename: `${sanitizeFilenameSegment(name || result.westernSign)}-${date || 'reading'}.pdf`,
      title: name.trim() ? `${name.trim()}'s Destiny Reading` : 'Destiny Reading',
      subtitle: `${result.westernSign} • ${result.chineseElement} ${result.chineseAnimal} • Life Path ${result.numerologyLifePath}`,
      sections: sectionsForPdf
    });
  }

  function handleReadAloud(): void {
    if (!speechSupported || !speechText) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    const voice = availableVoices.find((item) => item.voiceURI === selectedVoiceUri);

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = speechRate;
    utterance.onstart = () => {
      setSpeechError('');
      setIsSpeaking(true);
    };
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setSpeechError('Speech synthesis failed in this browser session.');
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  function handleStopReading(): void {
    if (!speechSupported) {
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  return (
    <main className="app-shell">
      <section className="hero card hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Destiny Engine + Grok</p>
          <h1>Symbolic profile, refined output, usable exports.</h1>
          <p className="lede">
            Local profile computation, sectioned Grok synthesis, downloadable PDF output, and native read-aloud.
          </p>
        </div>

        <div className="hero-metrics" aria-hidden="true">
          <div className="metric-card">
            <span className="metric-value">6</span>
            <span className="metric-label">Structured sections</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">PDF</span>
            <span className="metric-label">Direct download</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">TTS</span>
            <span className="metric-label">Native narration</span>
          </div>
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
          <article className="card summary-card accent-card">
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

          <div className="content-grid">
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
                    onClick={handlePdfExport}
                    disabled={!renderedReading}
                  >
                    Export PDF
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleReadAloud}
                    disabled={!speechSupported || !speechText || isReadingLoading}
                  >
                    {isSpeaking ? 'Restart narration' : 'Read aloud'}
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={handleStopReading}
                    disabled={!speechSupported || !isSpeaking}
                  >
                    Stop
                  </button>
                  {isReadingLoading && <span className="pill status-pill">Waiting for Puter + Grok</span>}
                </div>
              </div>

              {speechSupported && (
                <div className="voice-toolbar">
                  <label>
                    <span>Voice</span>
                    <select value={selectedVoiceUri} onChange={(e) => setSelectedVoiceUri(e.target.value)}>
                      {availableVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Rate</span>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(Number(e.target.value))}
                    />
                    <strong>{speechRate.toFixed(2)}×</strong>
                  </label>
                </div>
              )}

              {!speechSupported && <p className="lede">Read-aloud requires the browser SpeechSynthesis API.</p>}
              {speechError && <p className="error-text">{speechError}</p>}
              {readingError && <p className="error-text">{readingError}</p>}

              {!readingError && isReadingLoading && (
                <p className="lede">
                  Sending the exact custom prompt plus the computed symbolic profile to Grok.
                </p>
              )}

              {!isReadingLoading && renderedReading && (
                <div
                  id="markdown-output"
                  className="markdown-output reading-output"
                  dangerouslySetInnerHTML={{ __html: renderedReading }}
                />
              )}

              {!isReadingLoading && !readingError && !renderedReading && reading && (
                <pre className="reading-raw">{reading}</pre>
              )}
            </article>

            <article className="card horoscope-card spotlight-card">
              <div className="summary-header">
                <div>
                  <p className="eyebrow">Daily signal</p>
                  <h3>Horoscope</h3>
                </div>
                <p className="lede">Rendered independently from the reading body so the daily signal stays isolated.</p>
              </div>

              {isReadingLoading && <p className="lede">Waiting for Grok to produce the daily horoscope.</p>}
              {!isReadingLoading && readingError && <p className="error-text">Daily horoscope unavailable while the Grok request is failing.</p>}
              {!isReadingLoading && !readingError && renderedHoroscope && (
                <div
                  id="horoscope-output"
                  className="markdown-output horoscope-output"
                  dangerouslySetInnerHTML={{ __html: renderedHoroscope }}
                />
              )}
              {!isReadingLoading && !readingError && !renderedHoroscope && (
                <p className="lede">The Grok response did not include a recognizable Daily Horoscope section.</p>
              )}
            </article>
          </div>

          <div className="stats-grid">
            <article className="card stat-card">
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

            <article className="card stat-card">
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
