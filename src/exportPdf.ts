const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 56;
const MARGIN_TOP = 64;
const MARGIN_BOTTOM = 64;
const BODY_FONT_SIZE = 12;
const TITLE_FONT_SIZE = 24;
const HEADING_FONT_SIZE = 16;
const LINE_HEIGHT = 18;
const MAX_CHARS_PER_LINE = 88;

type PdfSection = {
  title: string;
  body: string;
};

type PdfDocumentInput = {
  filename: string;
  title: string;
  subtitle?: string;
  sections: PdfSection[];
};

type PdfTextLine = {
  text: string;
  fontSize: number;
  leading: number;
};

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function sanitizeText(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[#*_`>-]/g, ' ')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function wrapParagraph(paragraph: string, maxChars = MAX_CHARS_PER_LINE): string[] {
  const words = paragraph.split(/\s+/).filter(Boolean);

  if (!words.length) {
    return [''];
  }

  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function buildTextLines({ title, subtitle, sections }: PdfDocumentInput): PdfTextLine[] {
  const lines: PdfTextLine[] = [
    { text: title, fontSize: TITLE_FONT_SIZE, leading: 30 }
  ];

  if (subtitle) {
    lines.push(...wrapParagraph(subtitle, 76).map((text) => ({ text, fontSize: BODY_FONT_SIZE, leading: LINE_HEIGHT })));
    lines.push({ text: '', fontSize: BODY_FONT_SIZE, leading: 10 });
  }

  for (const section of sections) {
    lines.push({ text: section.title, fontSize: HEADING_FONT_SIZE, leading: 24 });

    const paragraphs = sanitizeText(section.body).split(/\n{2,}/).filter(Boolean);

    if (!paragraphs.length) {
      lines.push({ text: '—', fontSize: BODY_FONT_SIZE, leading: LINE_HEIGHT });
      lines.push({ text: '', fontSize: BODY_FONT_SIZE, leading: 8 });
      continue;
    }

    for (const paragraph of paragraphs) {
      const normalized = paragraph
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ');

      lines.push(...wrapParagraph(normalized).map((text) => ({ text, fontSize: BODY_FONT_SIZE, leading: LINE_HEIGHT })));
      lines.push({ text: '', fontSize: BODY_FONT_SIZE, leading: 8 });
    }
  }

  return lines;
}

function paginate(lines: PdfTextLine[]): PdfTextLine[][] {
  const pages: PdfTextLine[][] = [];
  let currentPage: PdfTextLine[] = [];
  let cursorY = PAGE_HEIGHT - MARGIN_TOP;

  for (const line of lines) {
    const requiredHeight = line.leading || LINE_HEIGHT;

    if (cursorY - requiredHeight < MARGIN_BOTTOM) {
      pages.push(currentPage);
      currentPage = [];
      cursorY = PAGE_HEIGHT - MARGIN_TOP;
    }

    currentPage.push(line);
    cursorY -= requiredHeight;
  }

  if (currentPage.length) {
    pages.push(currentPage);
  }

  return pages.length ? pages : [[{ text: 'No content available.', fontSize: BODY_FONT_SIZE, leading: LINE_HEIGHT }]];
}

function buildPageStream(pageLines: PdfTextLine[]): string {
  let y = PAGE_HEIGHT - MARGIN_TOP;
  let output = 'BT\n';

  for (const line of pageLines) {
    output += `/F1 ${line.fontSize} Tf\n`;
    output += `1 0 0 1 ${MARGIN_X} ${y} Tm\n`;
    output += `(${escapePdfText(line.text)}) Tj\n`;
    y -= line.leading;
  }

  output += 'ET';
  return output;
}

function createPdfBlob(input: PdfDocumentInput): Blob {
  const pages = paginate(buildTextLines(input));
  const objects: string[] = [];
  const addObject = (content: string): number => {
    objects.push(content);
    return objects.length;
  };

  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageIds: number[] = [];
  const contentIds: number[] = [];

  for (const page of pages) {
    const stream = buildPageStream(page);
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    contentIds.push(contentId);
    pageIds.push(0);
  }

  const pagesId = addObject('');

  pageIds.forEach((_, index) => {
    pageIds[index] = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`
    );
  });

  objects[pagesId - 1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`;
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

export function downloadReadingPdf(input: PdfDocumentInput): void {
  const blob = createPdfBlob(input);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = input.filename;
  anchor.click();

  globalThis.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1_000);
}
