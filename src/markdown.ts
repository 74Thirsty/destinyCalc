const CODE_BLOCK_PLACEHOLDER = '%%CODE_BLOCK_';
const INLINE_CODE_PLACEHOLDER = '%%INLINE_CODE_';
const BOLD_PLACEHOLDER = '%%BOLD_';
const ITALIC_PLACEHOLDER = '%%ITALIC_';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function wrapList(items: string[]): string {
  if (!items.length) {
    return '';
  }

  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function applyInlineFormatting(value: string): string {
  const inlineCodeTokens: string[] = [];
  let output = value.replace(/`([^`]+)`/g, (_match, code: string) => {
    const token = `${INLINE_CODE_PLACEHOLDER}${inlineCodeTokens.length}%%`;
    inlineCodeTokens.push(`<code>${code}</code>`);
    return token;
  });

  const boldTokens: string[] = [];
  output = output.replace(/\*\*([^*]+)\*\*/g, (_match, content: string) => {
    const token = `${BOLD_PLACEHOLDER}${boldTokens.length}%%`;
    boldTokens.push(`<strong>${content}</strong>`);
    return token;
  });

  const italicTokens: string[] = [];
  output = output.replace(/(^|\W)\*([^*]+)\*(?=\W|$)/g, (_match, prefix: string, content: string) => {
    const token = `${ITALIC_PLACEHOLDER}${italicTokens.length}%%`;
    italicTokens.push(`${prefix}<em>${content}</em>`);
    return token;
  });

  for (const [index, token] of inlineCodeTokens.entries()) {
    output = output.replaceAll(`${INLINE_CODE_PLACEHOLDER}${index}%%`, token);
  }

  for (const [index, token] of boldTokens.entries()) {
    output = output.replaceAll(`${BOLD_PLACEHOLDER}${index}%%`, token);
  }

  for (const [index, token] of italicTokens.entries()) {
    output = output.replaceAll(`${ITALIC_PLACEHOLDER}${index}%%`, token);
  }

  return output;
}

export function renderMarkdown(markdown: string): string {
  const trimmed = markdown.trim();

  if (!trimmed) {
    return '';
  }

  const escaped = escapeHtml(trimmed).replace(/\r\n/g, '\n');
  const codeBlocks: string[] = [];
  let content = escaped.replace(/```([\s\S]*?)```/g, (_match, block: string) => {
    const token = `${CODE_BLOCK_PLACEHOLDER}${codeBlocks.length}%%`;
    codeBlocks.push(`<pre><code>${block.trim()}</code></pre>`);
    return token;
  });

  const blocks = content.split(/\n\s*\n/);
  const htmlBlocks: string[] = [];

  for (const block of blocks) {
    const normalized = block.trim();

    if (!normalized) {
      continue;
    }

    const listItems = normalized
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^[-*]\s+/.test(line))
      .map((line) => applyInlineFormatting(line.replace(/^[-*]\s+/, '')));

    const allLinesAreListItems = listItems.length > 0 && normalized.split('\n').every((line) => /^[-*]\s+/.test(line.trim()));

    if (allLinesAreListItems) {
      htmlBlocks.push(wrapList(listItems));
      continue;
    }

    if (normalized.startsWith(CODE_BLOCK_PLACEHOLDER)) {
      htmlBlocks.push(normalized);
      continue;
    }

    const headingMatch = normalized.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      htmlBlocks.push(`<h${level}>${applyInlineFormatting(headingMatch[2].trim())}</h${level}>`);
      continue;
    }

    const lines = normalized.split('\n').map((line) => line.trim());
    htmlBlocks.push(`<p>${applyInlineFormatting(lines.join('<br />'))}</p>`);
  }

  content = htmlBlocks.join('');

  for (const [index, block] of codeBlocks.entries()) {
    content = content.replaceAll(`${CODE_BLOCK_PLACEHOLDER}${index}%%`, block);
  }

  return content;
}
