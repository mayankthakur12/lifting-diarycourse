# UI Coding Standards

These standards apply to **all** UI code throughout this project. They are not
optional and there are no per-feature exceptions.

## Components: shadcn/ui only

- **Only [shadcn/ui](https://ui.shadcn.com/) components may be used to build the
  UI.** Add the components you need with the shadcn CLI (e.g.
  `npx shadcn@latest add button`) so they land in the project's components
  directory.
- **Do not create custom components.** Absolutely no bespoke, hand-rolled, or
  wrapper UI components are permitted. If a piece of UI is needed, it must be
  composed directly from existing shadcn/ui components.
- If shadcn/ui does not provide something you think you need, stop and raise it
  for discussion rather than building a custom component. Composition of shadcn
  primitives is expected to cover the vast majority of cases.
- Styling is done with the Tailwind utility classes that shadcn/ui components
  already expect. Do not introduce alternative styling systems or component
  libraries.

## Date formatting: date-fns only

- **All date formatting must go through [`date-fns`](https://date-fns.org/).** Do
  not use `toLocaleDateString`, `Intl.DateTimeFormat`, manual string building, or
  any other date library.
- Dates are displayed in this exact format — day of month with its ordinal
  suffix, abbreviated month, full year:

  ```
  1st Sep 2025
  2nd Aug 2026
  23rd Nov 2025
  ```

- Use the `do MMM yyyy` format string:

  ```ts
  import { format } from "date-fns";

  format(new Date(2025, 8, 1), "do MMM yyyy"); // "1st Sep 2025"
  format(new Date(2026, 7, 2), "do MMM yyyy"); // "2nd Aug 2026"
  ```

- Keep formatting at the display boundary. Store and pass dates as `Date`
  objects or ISO strings, and format them with `date-fns` only when rendering.
