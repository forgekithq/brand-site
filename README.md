# brand-site

Official website for [Forgekit](https://forgekithq.dev).

## Tech Stack

- [Astro](https://astro.build) — Static site generator
- [Tailwind CSS](https://tailwindcss.com) v4 — Styling
- [Cloudflare Pages](https://pages.cloudflare.com) — Hosting

## Development

```bash
npm install
npm run dev          # Start dev server at localhost:4321
npm run build        # Build for production
npm run preview      # Preview production build
npx astro check      # TypeScript + template validation
```

## Deployment

Pushes to `main` auto-deploy to Cloudflare Pages via GitHub Actions.

## Content

Blog posts go in `src/content/blog/` as Markdown files.

See the collection schema in `src/content.config.ts`.
