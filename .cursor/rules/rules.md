1. Code Quality

Write clean, readable, self-explanatory code.

Prefer clarity over cleverness.

Follow the Single Responsibility Principle for functions and components.

Use descriptive names for variables, functions, and components.

Avoid deep nesting; refactor when logic becomes complex.

2. Folder & File Structure

Organize code by domain/feature, not by file type.

Keep related logic in the same area to maximize cohesion.

Avoid large multi-purpose files; split responsibilities.

3. Git Workflow

Commit frequently with meaningful messages.

Do not commit .env, secrets, credentials, or generated files.

Follow the sequence: Branch → Commit → Pull Request → Review → Merge.

4. Error Handling

Always handle async errors with try/catch or .catch().

Never leave unhandled promise rejections.

Define and follow a consistent format for API error responses.

Provide meaningful error messages for debugging.

5. Performance

Cache aggressively where applicable.

Avoid unnecessary re-renders or expensive operations.

Use pagination, lazy loading, and streaming when dealing with large data sets.

Reduce bundle size: remove dead code and unused dependencies.

6. Security

Validate all input on both backend and frontend.

Escape or sanitize user-generated content.

Never store plain secrets in source code.

Use secure cookies and enforce HTTPS when applicable.

Avoid exposing internal API details in the client.

7. CSS & UI Practices

Maintain a consistent UI using design tokens or a system.

Prefer reusable components.

Avoid inline styles except for trivial cases.

Write responsive layouts by default.

Keep spacing, colors, and typography consistent.

8. API & Backend Conventions

Follow consistent REST or GraphQL principles.

Use semantic, predictable URL structures.

Always return correct HTTP status codes.

Document all endpoints and expected behaviors.

Keep input/output schemas consistent and well typed.

9. Reusability & DRY

Avoid repeating logic across files.

Extract reusable utilities, hooks, helpers, and components.

Prefer composition instead of inheritance.

Reuse existing patterns and architecture decisions inside the repo.

10. Testing

Prioritize tests for critical functionalities (auth, payments, business logic).

Write integration tests before end-to-end tests.

Mock external services/APIs.

Ensure tests run consistently across environments.

11. Comments & Documentation

Comment why, not what.

Document complex flows, business rules, and edge cases.

Keep README, architecture notes, and API documentation updated.

Add inline explanations when logic is non-obvious.


Prefer TypeScript with strict typing.

Use modern ES features consistently.

Fix TypeScript errors before code generation continues.

Use functional React components and hooks.

Follow existing architecture and project structure.

Never create duplicated helpers/components.

If a task requires writing many files or major refactoring, Cursor must ask for confirmation before proceeding.

Suggestions must follow all rules in this document.