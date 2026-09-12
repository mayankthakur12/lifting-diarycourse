# Authentication Standards

These standards apply to **all** authentication and authorization code
throughout this project. They are not optional and there are no per-feature
exceptions.

## Clerk is the only auth provider

- **This app uses [Clerk](https://clerk.com/) for authentication.** All sign-up,
  sign-in, session, and user-identity concerns go through Clerk.
- Do **NOT** introduce any other auth mechanism: no NextAuth/Auth.js, no
  hand-rolled sessions, no custom JWT issuing/verification, no password handling,
  no OAuth clients of our own, no bespoke cookies.
- Use the official packages only — `@clerk/nextjs` for App Router code and
  `@clerk/nextjs/server` for server-side helpers. Do not call the Clerk REST API
  directly when an SDK helper exists.

## Middleware

- Clerk middleware is wired up in `src/proxy.ts` via `clerkMiddleware()` from
  `@clerk/nextjs/server`. There is exactly one middleware entry point — do not
  add a second one.
- Route protection rules belong in that middleware. When a route needs to be
  public or protected, adjust the matcher / `clerkMiddleware` callback there
  rather than scattering guards across pages.

## `<ClerkProvider>`

- `<ClerkProvider>` wraps the app once, in `src/app/layout.tsx`. Do not nest
  additional providers.

## Reading the current user

### Server (Server Components, `/data` helpers, Server Actions)

- Resolve identity with `auth()` from `@clerk/nextjs/server` (or
  `currentUser()` when you need the full user object).
- Ownership of data is **always** derived from `auth()` on the server — never
  from a caller-supplied id, param, query string, or request body. This mirrors
  the rule in `docs/data-fetching.md`.
- If `userId` is null (no session), the code must not return or mutate
  user-owned data. Return an empty result, redirect, or throw — never fall
  through.

  ```ts
  import { auth } from "@clerk/nextjs/server";

  const { userId } = await auth();
  if (!userId) return [];
  ```

### Client (`"use client"` components)

- Use Clerk's hooks/components: `useAuth()`, `useUser()`, `<SignedIn>`,
  `<SignedOut>`, `<Show>`, `<UserButton>`, `<SignInButton>`, `<SignUpButton>`.
- The client is for UI state only. Never trust a client-side auth check for
  access control — the server helper is the source of truth.

## Sign-in / sign-up UI

- Auth screens live at `src/app/sign-in/[[...sign-in]]/page.tsx` and
  `src/app/sign-up/[[...sign-up]]/page.tsx`, each rendering Clerk's `<SignIn />`
  / `<SignUp />` component. Do not build custom credential forms.
- Entry points elsewhere (e.g. the landing page) use `<SignInButton>` /
  `<SignUpButton>` and gate visible content with `<Show when="signed-in">` /
  `<Show when="signed-out">`.

## Configuration & secrets

- Clerk keys come from environment variables
  (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and any
  `NEXT_PUBLIC_CLERK_*` redirect URLs). They are read from `.env` and must never
  be hard-coded or committed.
- Never log, serialize, or send the secret key or a session token anywhere other
  than to Clerk itself.
