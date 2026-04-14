# Getting Started

This guide will walk you through setting up the Maison Slimani environment locally.

## 1. Prerequisites
- **Node.js**: >= 20.x
- **Package Manager**: pnpm (Required for workspace compatibility)
- **Supabase CLI**: Required for local database instances

## 2. Installation
The repository is managed via `pnpm` workspaces. Ensure you do not use `npm` or `yarn` at the root as it will violate lockfile integrity.

```bash
# Clone the repository
git clone <repository_url>

# Install dependencies across all packages and apps
pnpm install
```

## 3. Environment Variables
Every application instance (`apps/web`, `apps/admin`) requires its own `.env.local` file. Request access to the development environment flags from your engineering lead.

Required configurations roughly isolate to:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Used specifically by the admin backend)

## 4. Local Development

Start the entire monorepo using Turborepo's optimized pipeline:
```bash
pnpm run dev
```
- `apps/web` running on port `3000`
- `apps/admin` running on port `5173` (Vite)

### Specific Development
If you only need to run a specific workspace:
```bash
pnpm --filter maison-slimani-web dev
```

## 5. Build and Verification
The CI/CD pipeline demands strict compliance. Ensure the project builds locally before issuing a Pull Request:
```bash
# Run ESLint constraints across all packages
pnpm lint

# Ensure zero TypeScript violations (tsc --noEmit)
pnpm typecheck

# Full production build simulation
pnpm build
```
