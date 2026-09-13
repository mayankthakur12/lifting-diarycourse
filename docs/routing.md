# Routing Standards

These standards apply to **all** routes and route protection throughout this
project. They are not optional and there are no per-feature exceptions.

## Everything lives under `/dashboard`

- **All application routes MUST be accessed via `/dashboard`.** `src/app/dashboard`
  is the root of the app's functionality — every feature page is `/dashboard`
  itself or a subpage of it (e.g. `/dashboard/workout/new`,
  `/dashboard/workout/[workoutId]`).
- Do not add feature routes outside `src/app/dashboard` (no top-level
  `src/app/<feature>/page.tsx`). The only routes outside `/dashboard` are
  non-app pages such as the landing page and the Clerk `sign-in` / `sign-up`
  routes described in `docs/auth.md`.

## `/dashboard` and all subpages are protected

- **`/dashboard` and every route nested under it MUST be accessible only to
  logged-in users.** There is no anonymous access to any dashboard page or
  server action beneath it.
- Route protection is enforced in **Next.js middleware** — not with per-page
  checks, layout-level redirects, or client-side guards. A page must never be
  the only thing standing between an anonymous request and protected content.

## Middleware is the single enforcement point

- The project's one middleware entry point is `src/proxy.ts`, wired up with
  `clerkMiddleware()` from `@clerk/nextjs/server` (see `docs/auth.md`).
- Protect `/dashboard` and its subpages by matching them inside that
  middleware with `createRouteMatcher` and calling `auth.protect()` for
  matched requests, e.g.:

  ```ts
  import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

  const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

  export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  });

  export const config = {
    matcher: [
      "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
      "/(api|trpc)(.*)",
      "/__clerk/:path*",
    ],
  };
  ```

- Do not duplicate this protection elsewhere (no redundant `auth()` redirect
  checks in `src/app/dashboard/layout.tsx` "just in case"). Middleware is the
  single source of truth for whether a request is allowed through; pages and
  server actions still resolve the current user via `auth()` for **data
  scoping**, as described in `docs/auth.md` and `docs/data-fetching.md`, but
  they are not responsible for the access-control decision itself.
- If a new route segment is added under `/dashboard`, no middleware change is
  needed — the `/dashboard(.*)` matcher already covers it. Only add a new
  matcher entry when introducing a protected route that lives outside
  `/dashboard`.
