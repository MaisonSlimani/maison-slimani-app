Browser & Frontend Security

Detect XSS risks (unsanitized HTML, dangerous DOM manipulation, unsafe React usage).

Detect unsafe redirects or URL parameter handling.

Detect insecure storage (localStorage tokens without protection).

Detect weak authentication flows.

Backend & API Security

Validate all incoming requests using schemas (e.g., Zod, Yup, Joi).

Check for SQL injection or NoSQL injection attack surfaces.

Check for command injection.

Enforce correct HTTP status codes and error responses.

Verify auth middleware placement and correct execution order.

Detect missing rate limits, missing brute-force protection.

Authentication & Authorization

Ensure access control is enforced at every protected route.

Detect role misconfigurations or insufficient permissions.

Ensure passwords are hashed and never logged.

Ensure JWTs or tokens are validated correctly (expiry, audience, issuer).

Secrets & Env Handling

Warn whenever secrets are hardcoded.

Ensure .env usage is correct and secure.

Detect accidental logging of secrets, tokens, or personal data.

Dependency & Supply Chain

Flag outdated packages with known vulnerabilities.

Flag high-risk or deprecated libraries.

Avoid unnecessary dependencies that increase attack surface.

Networking & API Calls

Detect unsafe fetch or Axios behavior.

Ensure CORS configuration is strict.

Prevent exposure of internal endpoints.

Data Safety

Detect unsafe serialization or deserialization.

Enforce data sanitization before storing or returning.

Detect sensitive fields leaked in API responses.

General Behavior

Cursor must always highlight vulnerabilities clearly.

Cursor must propose safer alternatives.

Cursor must never ignore a possible security flaw, even if uncertain.

Cursor must always provide code patches to fix vulnerabilities.