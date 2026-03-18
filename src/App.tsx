import { FormEvent, useMemo, useState } from 'react';
import { calculateProfile } from './engine';
import type { EngineResult } from './types';

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
  const canSubmit = useMemo(() => Boolean(date), [date]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date) return;

    setResult(
      calculateProfile({
        name: name.trim() || undefined,
        date,
        time: time || undefined,
        location: location.trim() || undefined
      })
    );
  }

  return (
    <main className="app-shell">
      <section className="hero card">
        <div>
          <p className="eyebrow">Destiny Engine MVP</p>
          <h1>Blended symbolic profile calculator</h1>
          <p className="lede">
            Enter a birth date and get a combined reading from Western zodiac, Chinese zodiac,
            element mapping, and numerology.
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

          <button type="submit" disabled={!canSubmit}>
            Calculate profile
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
