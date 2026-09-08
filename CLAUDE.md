# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

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
