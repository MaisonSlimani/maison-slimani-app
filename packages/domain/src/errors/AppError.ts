/**
 * Base class for all application errors.
 * Ensures consistent error handling and metadata across the monorepo.
 */
export abstract class AppError extends Error {
  public abstract readonly code: string;
  public abstract readonly statusCode: number;
  public readonly metadata?: Record<string, unknown>;

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.metadata = metadata;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
    };
  }
}

/**
 * Errors originating from business rule violations.
 */
export class DomainError extends AppError {
  public readonly code = 'DOMAIN_ERROR';
  public readonly statusCode = 400;
}

/**
 * Error when a requested resource is not found.
 */
export class NotFoundError extends AppError {
  public readonly code = 'NOT_FOUND';
  public readonly statusCode = 404;
}

/**
 * Error for database or external service failures.
 */
export class InfrastructureError extends AppError {
  public readonly code = 'INFRASTRUCTURE_ERROR';
  public readonly statusCode = 500;
}

/**
 * Error for validation failures (e.g., Zod).
 */
export class ValidationError extends AppError {
  public readonly code = 'VALIDATION_ERROR';
  public readonly statusCode = 422;
}

/**
 * Error for state conflicts (e.g., stock mismatch).
 */
export class ConflictError extends AppError {
  public readonly code = 'CONFLICT';
  public readonly statusCode = 409;
}
