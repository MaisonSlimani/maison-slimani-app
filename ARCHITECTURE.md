# Maison Slimani Architecture

This document describes the architectural principles and patterns used in the Maison Slimani monorepo.

## Architectural Maturity: 10/10 (Clean Architecture)

The project follows a strict **Clean Architecture** pattern to ensure decoupling between business logic and infrastructure.

### 1. Monorepo Layers

-   **`apps/web`**: Next.js 15 application. Contains only UI logic, components, and controllers. No business logic lives here.
-   **`packages/domain`**: The "Heart" of the application. Pure business logic, entity models, service interfaces, and Zod schemas. Zero dependencies on database or frameworks.
-   **`packages/db`**: Infrastructure layer for Supabase/PostgreSQL. Implements repository interfaces defined in the domain. Handles mapping between DB-shaped JSON and clean Domain models.
-   **`packages/shared`**: Cross-cutting concerns: utilities, logger, persistent store, and infrastructure implementation details (like DOMPurify).
-   **`packages/ui`**: Shared UI component library.

### 2. Dependency Direction

Dependencies always point **inward** toward the Domain layer:
`UI -> Domain`
`Infrastructure -> Domain`
`UI -> Infrastructure` (Only via interfaces/contracts)

🚫 **Domain never imports from Infrastructure or UI.**

### 3. Repository Pattern & Mapping (Anti-Corruption Layer)

We use the Repository pattern to decouple the Domain from the database schema.
-   **Repository Interface**: Defined in `packages/domain/src/repositories`.
-   **Repository Implementation**: Defined in `packages/db/src/repositories`.
-   **Mapping**: The `ProductRepository` maps database fields (e.g., `nom`, `prix`) to clean Domain properties (`name`, `price`) during retrieval. This allows the Domain to remain in clear, English-based camelCase regardless of the underlying storage format.

### 4. HTML Sanitization

To preserve Domain purity, HTML sanitization is abstracted via an `IHtmlSanitizer` interface.
-   The contract lives in `Domain`.
-   The implementation (using `isomorphic-dompurify`) lives in `Shared`.
-   Initialization occurs in the `boot()` sequence of the application.

### 5. Error Handling

We use a structured error hierarchy defined in `packages/domain/src/errors/AppError.ts`.
-   `DomainError`: Business rule violations.
-   `InfrastructureError`: DB or API failures.
-   `ValidationError`: Schema validation failures.
-   `ConflictError`: State/Stock conflicts.

### 6. Configuration Management

Environment variables are validated at startup using Zod schemas in `@maison/shared`. This prevents the application from entering a "blunder" state with missing critical keys.

---
*Created by Antigravity - Lead Architect*
