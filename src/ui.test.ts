import { describe, expect, it } from 'vitest';
import { generateDailyHoroscope } from './horoscope';
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

  it('returns a deterministic daily horoscope per sign and date', () => {
    const date = new Date('2026-03-19T00:00:00.000Z');
    const first = generateDailyHoroscope('Aquarius', date);
    const second = generateDailyHoroscope('Aquarius', date);

    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(0);
  });
});
