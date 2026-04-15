# Core Architecture & Engineering Rules

## 1. Separation of Concerns (SOC)

* **Hard Limit:** No source file should exceed **300 lines**.
* If a file approaches this limit, refactor immediately by extracting logic into smaller, focused modules or components.
* Maintain an **intuitive project structure** aligned with industry-standard patterns.

---

## 2. Clean Architecture & Dependency Direction

* **Primary Rule:** Business logic must be fully decoupled from frameworks, UI, and infrastructure.

* Dependencies must always point **inward (toward the domain layer)**.

* Outer layers (UI, APIs, databases) depend on inner layers — never the reverse.

* Define **interfaces/contracts in the domain**, and implement them in outer layers.

🚫 Domain importing DB / API / framework code is strictly forbidden.

---

## 3. Explicit Module Boundaries

* Every module must expose a **clear, minimal public API**.
* Internal implementation details must remain private.
* No cross-module “reach-ins” (importing deep internal files).

---

## 4. DRY (Don’t Repeat Yourself)

* Any duplicated logic must be abstracted into shared utilities or services.
* Avoid premature abstraction — only extract when duplication is confirmed.

---

## 5. Cognitive Complexity Control

* Code must remain:

  * flat
  * readable
  * easy to reason about

* Avoid:

  * deep nesting
  * long functions
  * implicit behavior

---

## 6. Side Effects Isolation

* All side effects must be isolated:

  * API calls
  * database operations
  * file system
  * timers

* Core business logic should be **pure and deterministic** whenever possible.

---

## 7. Deterministic & Stateless Core

* Business logic must:

  * produce consistent outputs for given inputs
  * avoid hidden state or global mutations

* State must be explicit and controlled.

---

## 8. Error Handling Strategy

* Use a **single consistent error handling approach** across the project:

  * either exceptions OR structured result objects

* Errors must be:

  * typed / structured
  * meaningful and actionable

* No silent failures or vague error messages.

---

## 9. Input Validation at Boundaries

* Validate all external inputs at system boundaries:

  * API endpoints
  * controllers
  * external services

* Internal layers must assume validated data.

---

## 10. Configuration Management

* No hardcoded environment-specific values:

  * URLs
  * API keys
  * environment flags

* All configuration must be centralized and injected.

---

## 11. Naming as Documentation

* Use **clear, intent-revealing names**.
* Avoid abbreviations unless industry standard.
* Prefer expressive naming over comments.

---

## 12. Testing Strategy

* **Mandatory:** All business logic must be covered by unit tests.

* Testing layers:

  * Unit tests → core logic
  * Integration tests → boundaries
  * E2E tests → optional

---

## 13. Idempotency & Reentrancy

* Critical operations must be safe to:

  * retry
  * execute multiple times without unintended side effects

---

## 14. Concurrency & Race Conditions

* Always consider:

  * parallel execution
  * shared state conflicts
  * async timing issues

* Design for predictable behavior under concurrency.

---

## 15. Versioning & Migration Discipline

* Any change to:

  * data schemas
  * APIs
  * contracts

Must be:

* backward compatible OR
* accompanied by a clear migration plan

---

## 16. Logging & Observability

* Logs must be:

  * structured
  * contextual (include identifiers when relevant)

* Avoid:

  * excessive logging
  * logging sensitive data

---

## 17. Performance Awareness

* Maintain awareness of:

  * API response times
  * resource usage
  * frontend bundle size

* Prevent silent performance degradation.

---

## 18. Security Baseline

* Enforce minimum security practices:

  * input sanitization
  * no secrets in source code
  * safe authentication handling

---

## 19. State Management Consistency

* Use a **single, well-defined state management strategy**.
* Avoid mixing multiple paradigms without clear boundaries.
* Clearly define:

  * where state lives
  * how it flows

---

## 20. Refactoring Discipline

* Refactoring is continuous and mandatory.

* If code becomes hard to read or maintain:

  * refactor immediately

* Technical debt must not accumulate.

---

## 21. Documentation Policy (Live Documentation)

* Documentation must always reflect the current system state.

* Every code change must be accompanied by documentation updates.

* Avoid redundant comments:

  * prefer self-explanatory code
  * document only non-obvious decisions or constraints

---

## 22. Rule Enforcement

* These rules are **non-optional**.
* If a proposed change violates:

  * Clean Architecture
  * dependency direction
  * or system integrity

It must be:

1. rejected
2. explained
3. replaced with a compliant alternative

---
