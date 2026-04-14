# Architecture & Topology

Maison Slimani employs a strict Monorepo layout managed by Turborepo. We use Clean Architecture principles to construct a robust, scaleable, and modular foundation.

## 1. Monorepo Structure

```text
maison-slimani-app/
├── apps/
│   ├── admin/      # Backoffice Portal (React + Vite)
│   └── web/        # Global E-commerce Platform (Next.js 15 App Router)
├── packages/
│   ├── config/     # Centralized ESLint/TS configs
│   ├── db/         # Infrastructure Layer (Supabase, DB Clients)
│   ├── domain/     # Enterprise Business Logic & DTO Interfaces
│   ├── shared/     # Shared Utilities & Validations
│   └── ui/         # Enterprise Component Library (Tailwind/Radix)
```

## 2. Dependency Direction (Domain-Driven Design)

To ensure the system remains testable and stateless where matters, dependencies must flow strictly **inward**.
- **`@maison/domain`** is our absolute Source of Truth. It contains native TS Interfaces describing the entity behavior (e.g. `Product`, `CategoryInput`, `Order`). **It must not import from any other internal package.**
- **`@maison/db`** executes implementations of `@maison/domain` repository interfaces. This is the only workspace that directly connects to Supabase instances. It maps DB rows exclusively to Domain objects.
- **`apps/*`** invoke `@maison/db` classes utilizing parameters derived strictly from `@maison/domain`. At no point should `apps/web` or `apps/admin` query Supabase directly bypassing the infrastructure layer. 

> [!WARNING]
> Bypassing `@maison/db` and generating raw queries inside component files (`apps/web`) is considered a critical architectural violation and will block PR merges.

## 3. Strict Layering & Type Contracts

Under no circumstances should `any` types be used. All inputs and outputs must pass through typed schemas (e.g. Zod validators exist in `@maison/domain/validation`). 

When bridging the boundary between the Database context and the Application UI, you must convert database responses (derived from `database.types.ts` native definitions) into cleanly formatted, structurally sound `camelCase` DTOs defined in the domain layer.

### Example Contract Boundary
```ts
// Bad (Direct schema dependency)
function fetchOrders() {
  const { data } = await supabase.from('commandes').select('*');
  return data; // Returns unstable DB notation types 
}

// Good (Repository Pattern)
class OrderRepository implements IOrderRepository {
   async findAll(): Promise<DomainResult<Order[]>> {
      // Maps underlying schema properties to camelCase Domain interface
   }
}
```
