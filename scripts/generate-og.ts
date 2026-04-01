import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const WIDTH = 1200;
const HEIGHT = 630;

export interface OgImageOptions {
  title: string;
  subtitle: string;
  width?: number;
  height?: number;
}

export async function generateOgSvg(
  options: OgImageOptions,
  fontData: ArrayBuffer,
): Promise<string> {
  const { title, subtitle, width = WIDTH, height = HEIGHT } = options;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #1e3a5f 100%)',
          padding: '60px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '48px',
                      height: '48px',
                      background: '#00d4aa',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#0a0a0a',
                    },
                    children: 'F',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '36px',
                      fontWeight: 700,
                      color: '#ffffff',
                      letterSpacing: '-0.02em',
                    },
                    children: 'Forgekit',
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '52px',
                fontWeight: 700,
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: '900px',
                marginBottom: '20px',
              },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '24px',
                color: '#e5e7eb',
                textAlign: 'center',
                maxWidth: '700px',
                lineHeight: 1.5,
              },
              children: subtitle,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '18px',
                color: '#00d4aa',
              },
              children: 'forgekithq.dev',
            },
          },
        ],
      },
    },
    {
      width,
      height,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );

  return svg;
}

export function svgToPng(svg: string, width: number = WIDTH): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

async function main() {
  const fontPath = join(
    ROOT,
    'node_modules',
    '@fontsource',
    'inter',
    'files',
    'inter-latin-700-normal.woff',
  );
  const fontData = readFileSync(fontPath).buffer as ArrayBuffer;

  const svg = await generateOgSvg(
    {
      title: 'Developer tools that respect your time.',
      subtitle:
        'Opinionated, production-ready templates and CLI tools for developers who ship.',
    },
    fontData,
  );

  const png = svgToPng(svg);

  const outDir = join(ROOT, 'public');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'og.png'), png);

  console.log(`OG image generated: public/og.png (${png.length} bytes)`);
}

main().catch((err) => {
  console.error('Failed to generate OG image:', err);
  process.exit(1);
});
