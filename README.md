# Steve Dunn Tools

[stevedunntools.com](https://stevedunntools.com): settlement calculators and utilities for lawyers, mediators, and parties in dispute resolution. Built with Next.js and deployed on Vercel from `main`.

## Working on it

```bash
npm run dev     # local server
npm test        # vitest: the pure math modules
npm run lint
npm run build   # what Vercel runs
```

Conventions and the reasoning behind them are in `CLAUDE.md` / `AGENTS.md`. Each tool lives under `app/tools/<slug>/` with its math in a `calculate.ts` (or `logic.ts` / `schedule.ts`) that the tests cover; the screen is `client.tsx`. Shared pieces are in `components/`; navigation, descriptions, and long-form content live in `lib/`.
