# Data Mutation Standards

These standards apply to **all** data mutations (create, update, delete) throughout
this project. They are not optional and there are no per-feature exceptions.

## Mutations run through `/data` helper functions

- **Every data mutation MUST live in a helper function inside the `src/data`
  directory.** These helpers wrap the underlying database calls; nothing outside
  `src/data` writes to the database directly.
- **Helper functions MUST use the Drizzle ORM query builder.**
- **DO NOT use raw SQL** (no `sql` template queries, no `db.execute`, no raw
  strings). Use Drizzle's typed query builder exclusively.
- Callers (server actions) import and call these helpers; they never issue
  `insert` / `update` / `delete` inline.

## Mutations are invoked only from server actions

- **All data mutations MUST be performed by server actions.**
- Server actions MUST live in a **colocated file named `actions.ts`** next to the
  feature that uses them (e.g. `src/app/workout/actions.ts`). Each such file
  begins with the `"use server"` directive.
- Data must **NOT** be mutated via:
  - Route handlers (`app/**/route.ts`)
  - Client Components (`"use client"`)
  - `useEffect` / client-side `fetch`
  - API endpoints of any kind
  - Any other mechanism

## Server action signatures

- **Every server action parameter MUST be explicitly typed.**
- **Server actions MUST NOT accept a `FormData`-typed parameter.** Pass a typed
  plain object from the caller instead; do not bind actions directly to a
  `<form action={...}>` that would hand them `FormData`.
- Keep the parameter shape a single typed object where practical, so validation
  has one clear target.

## Every server action validates its arguments with Zod

- **Every server action MUST validate the arguments passed to it using a Zod
  schema** before doing any work.
- Parse at the top of the action (`schema.parse(...)` or `safeParse`) and operate
  only on the parsed, typed result.
- The static parameter type and the Zod schema must describe the same shape —
  derive the type with `z.infer` from the schema where possible so they cannot
  drift apart.
- If validation fails, the action must not call any `/data` helper.

## Shape at a glance

```ts
// src/app/workout/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutInput = z.object({
  name: z.string().min(1),
  performedAt: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutInput>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const data = createWorkoutInput.parse(input);
  return createWorkout(data);
}
```

```ts
// src/data/workouts.ts — wraps the Drizzle call, scoped to the logged-in user
export async function createWorkout(input: { name: string; performedAt: Date }) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [row] = await db
    .insert(workouts)
    .values({ ...input, userId })
    .returning();

  return row;
}
```

## User scoping still applies

- As with reads, every `/data` mutation helper that touches user-owned tables
  MUST resolve the current authenticated user's id from the session and constrain
  the write to that user. Never accept a user id from the caller, params, or
  request body as the source of ownership.
