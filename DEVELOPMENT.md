# Maison Slimani Development Guide

This guide provides technical instructions for developing, testing, and building the Maison Slimani monorepo.

## Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase CLI (if working on DB migrations)

## Getting Started

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Setup environment**:
    Copy `.env.example` to `.env.local` in `apps/web` and fill in the Supabase credentials.
    ```bash
    cp apps/web/.env.example apps/web/.env.local
    ```

3.  **Run development server**:
    ```bash
    pnpm dev
    ```

## Project Structure

- `apps/web`: Next.js 15 frontend.
- `packages/domain`: Business logic and models.
- `packages/db`: Supabase integration and repositories.
- `packages/shared`: Shared utilities and infrastructure.

## Testing

All business logic in the Domain layer is covered by unit tests.

- **Run all tests**:
  ```bash
  pnpm test
  ```

- **Run domain tests only**:
  ```bash
  pnpm --filter @maison/domain test
  ```

## Quality Standards

- **SOC (Separation of Concerns)**: No source file should exceed 300 lines.
- **Clean Architecture**: Domain must remain pure. Infrastructure must implement interfaces.
- **Naming**: Use English camelCase for all domain properties. Legacy French names are allowed ONLY in database rows and mapped immediately in Repositories.

## Deployment

The app is optimized for Vercel. Ensure all environment variables validated in `apps/web/lib/utils/env.ts` are set in the Vercel dashboard.

---
*Created by Antigravity*
