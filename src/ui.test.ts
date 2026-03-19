import { describe, expect, it } from 'vitest';
import { parseDestinyReading } from './grok';
import { renderMarkdown } from './markdown';

describe('ui helpers', () => {
  it('renders markdown headings, emphasis, lists, and code safely', () => {
    const html = renderMarkdown(`# Heading\n\n- **Bold** item\n- *Italic* item\n\n\`const x = 1\`\n\n<script>alert(1)</script>`);

    expect(html).toContain('<h1>Heading</h1>');
    expect(html).toContain('<ul><li><strong>Bold</strong> item</li><li><em>Italic</em> item</li></ul>');
    expect(html).toContain('<code>const x = 1</code>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('extracts horoscope into its own section from markdown headings', () => {
    const sections = parseDestinyReading(`## Core Identity\n\nBuilder mode.\n\n## Strengths\n\nHigh agency.\n\n## Daily Horoscope\n\nShip before noon.`);

    expect(sections).toEqual([
      { title: 'Core Identity', body: 'Builder mode.', content: 'Builder mode.' },
      { title: 'Strengths', body: 'High agency.', content: 'High agency.' },
      { title: 'Daily Horoscope', body: 'Ship before noon.', content: 'Ship before noon.' }
    ]);
  });
});
