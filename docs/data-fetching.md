# Data Fetching Standards

These standards apply to **all** data access throughout this project. They are
not optional and there are no per-feature exceptions.

## Fetch data only in Server Components

- **All data fetching in this app MUST be done via Server Components.**
- Data must **NOT** be fetched via:
  - Route handlers (`app/**/route.ts`)
  - Client Components (`"use client"`)
  - `useEffect` / client-side `fetch`
  - API endpoints of any kind
  - Any other mechanism
- If a Client Component needs data, fetch it in a Server Component and pass it
  down as props.
- This is incredibly important. There are no exceptions.

## Database queries: helper functions in `/data` only

- **Every database query MUST live in a helper function inside the `/data`
  directory.** Server Components import and call these helpers; they never query
  the database inline.
- **Helper functions MUST use the Drizzle ORM query builder.**
- **DO NOT use raw SQL** (no `sql` template queries, no `db.execute`, no raw
  strings). Use Drizzle's typed query builder exclusively.

## Every query is scoped to the logged-in user

- A logged-in user can **ONLY** access their own data. They must **never** be
  able to read or write any data that does not belong to them.
- Every `/data` helper that touches user-owned tables MUST:
  - Resolve the current authenticated user's id from the session on the server.
  - Include a `where` clause filtering by that user's id on every read and
    write.
  - Never accept a user id from the caller, request, params, or query string as
    the source of ownership — always derive it from the session.
- If the current user cannot be resolved, the helper must not return data.
