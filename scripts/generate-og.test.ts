import { describe, it, expect } from 'vitest';
import { generateOgSvg, svgToPng } from './generate-og.js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadFont(): ArrayBuffer {
  const fontPath = join(
    ROOT,
    'node_modules',
    '@fontsource',
    'inter',
    'files',
    'inter-latin-700-normal.woff',
  );
  return readFileSync(fontPath).buffer as ArrayBuffer;
}

describe('generateOgSvg', () => {
  it('should return a valid SVG string', async () => {
    const svg = await generateOgSvg(
      {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
      },
      loadFont(),
    );

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('should use default dimensions (1200x630)', async () => {
    const svg = await generateOgSvg(
      {
        title: 'Test',
        subtitle: 'Sub',
      },
      loadFont(),
    );

    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="630"');
  });

  it('should accept custom dimensions', async () => {
    const svg = await generateOgSvg(
      {
        title: 'Test',
        subtitle: 'Sub',
        width: 800,
        height: 400,
      },
      loadFont(),
    );

    expect(svg).toContain('width="800"');
    expect(svg).toContain('height="400"');
  });
});

describe('svgToPng', () => {
  it('should convert SVG to PNG buffer', async () => {
    const svg = await generateOgSvg(
      {
        title: 'PNG Test',
        subtitle: 'Conversion',
      },
      loadFont(),
    );

    const png = svgToPng(svg);

    expect(png).toBeInstanceOf(Buffer);
    expect(png.length).toBeGreaterThan(0);
    // PNG magic bytes
    expect(png[0]).toBe(0x89);
    expect(png[1]).toBe(0x50); // P
    expect(png[2]).toBe(0x4e); // N
    expect(png[3]).toBe(0x47); // G
  });

  it('should produce reasonable file size (10KB-500KB)', async () => {
    const svg = await generateOgSvg(
      {
        title: 'Developer tools that respect your time.',
        subtitle: 'Opinionated, production-ready templates and CLI tools.',
      },
      loadFont(),
    );

    const png = svgToPng(svg);

    expect(png.length).toBeGreaterThan(10_000);
    expect(png.length).toBeLessThan(500_000);
  });
});
