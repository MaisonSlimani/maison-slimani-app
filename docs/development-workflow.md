# Development Workflow

Maison Slimani adheres to high-precision engineering workflows designed to eliminate cognitive overload, preserve stateless code behaviors, and maximize frontend performance.

## 1. Clean Coding Rules

This repository incorporates an automated linting configuration built perfectly to enforce **Separation of Concerns**:
- **Code Must Remain Flat**: Functions contain strict nesting ceilings. Implicit hidden behaviors are discouraged.
- **Maximum Line Width**: Hard cap set on files. If a file exceeds **300 lines**, it must be aggressively refactored.
- **Function Complexity Cap**: Complex cognitive loops (score > 15) throw syntax validation errors. If a rendering function becomes too heavy, slice it into discrete UI components locally. 

## 2. API & Data Fetching

- Use **Next.js Native Hooks** (`React Server Components` + `Server Actions`) whenever data can be loaded statically or pre-fetched.
- Use **React Query** for all client-side data fetching that is mutable, async, and highly interactive. Do not manually track `loading` and `error` states using isolated `useState` constructs for data fetching.

## 3. UI Composition (shadcn/ui + Tailwind)

All UI elements must utilize the common library exported from `packages/ui` (`@maison/ui`).
Avoid creating ad-hoc div styling unless building an extremely specific layout construct. 

**Color Palette Protocol**:
We operate on a strictly enforced token-based color system. You should reference `var(--charbon)`, `var(--dore)`, `var(--ecru)`, etc., implemented primarily as Tailwind constants (`bg-charbon`, `text-dore`). Hard-coding generic browser hexes is banned unless specifically testing localized SVGs.

## 4. Error Management (Result Pattern)

We eschew native silent failing exceptions where feasible in the business layer for structured `DomainResult` wrappers.

```typescript
// Prefer explicit predictable Domain returns:
interface DomainResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Handler Example
const result = await productRepository.create(payload);
if (!result.success) {
    toast.error(result.error);
    return;
}
```

## 5. Security & Idempotency Baseline
1. No environment values are hardcoded. Access parameters using typed configs.
2. Validate bounding API limits (never trust raw Request payloads inside Server Actions without Zod schema checking first).
3. Critical cart validation logic and checkout computations must always run on the backend node environment.
