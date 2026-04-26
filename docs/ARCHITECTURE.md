# Architecture

## Overview

The NWL Panel follows a modular, feature-based architecture.

---

## Structure

```
features/
  auth/
  tenants/
  members/

shared/
  api/
  ui/
  utils/

app/
  providers/
  router/
  theme/
```

---

## Data Flow

Component → React Query → API Client → Zod → Backend

---

## Typing Strategy

Zod-first typing:

```ts
const Schema = z.object({...})
type Type = z.infer<typeof Schema>
```

---

## Styling

- Material UI → components
- Tailwind → layout
