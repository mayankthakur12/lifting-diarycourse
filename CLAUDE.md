# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## ALWAYS check `/docs` first

Before generating or modifying ANY code, Claude Code MUST first read the relevant documentation file in the `/docs` directory and follow it. These docs are the source of truth for project conventions and override general assumptions. Current docs:

- `docs/ui.md` — UI conventions and guidance.
- 'docs/data-fetching.md' - Data  fetching principles
- `docs/auth.md` — Authentication standards (Clerk).
- `docs/data-mutation.md` — Data mutation standards.
- `docs/routing.md` — Routing and route-protection standards.

If no doc covers the area you are working on, proceed with general best practices, but check `/docs` first every time.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint with ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next`)

No test runner is configured yet.

## Architecture

This is a Next.js App Router project (Next.js 16, React 19, TypeScript, Tailwind CSS 4) currently at the `create-next-app` scaffold stage — `src/app/layout.tsx` and `src/app/page.tsx` are still the generated defaults, with no application-specific routes, components, or data layer built out yet.

- `src/app/` — App Router pages/layouts; `@/*` path alias resolves to `src/*` (see `tsconfig.json`).
- Styling is Tailwind CSS 4 via `@tailwindcss/postcss` (`postcss.config.mjs`), with global styles in `src/app/globals.css`.
