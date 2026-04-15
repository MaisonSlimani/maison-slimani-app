/**
 * Base class for all repository errors.
 */
export class RepositoryError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public status: number = 500,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

/**
 * Specifically for not found errors.
 */
export class NotFoundError extends RepositoryError {
  constructor(resource: string, identifier: string) {
    super(`${resource} with identifier "${identifier}" not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Specifically for constraint/validation failures.
 */
export class ValidationError extends RepositoryError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, originalError);
    this.name = 'ValidationError';
  }
}

/**
 * Specifically for database connection/availability issues.
 */
export class DatabaseConnectionError extends RepositoryError {
  constructor(originalError?: unknown) {
    super('Database connection failure', 'CONNECTION_ERROR', 503, originalError);
    this.name = 'DatabaseConnectionError';
  }
}

/**
 * Specifically for conflict errors (e.g. unique constraint violation).
 */
export class ConflictError extends RepositoryError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'CONFLICT', 409, originalError);
    this.name = 'ConflictError';
  }
}

/**
 * Maps Supabase/Postgres error codes to RepositoryError classes.
 */
export function mapDatabaseError(error: unknown): RepositoryError {
  if (error instanceof RepositoryError) return error;
  
  const err = error as Record<string, unknown>;
  const code = typeof err?.code === 'string' ? err.code : undefined;
  const message = typeof err?.message === 'string' ? err.message : 'Unknown database error';

  switch (code) {
    case '23505': // unique_violation
      return new ConflictError('A record with this unique identifier already exists', error);
    case '23503': // foreign_key_violation
      return new ValidationError('Referenced record does not exist', error);
    case 'PGRST116': // JSON validation or single result requirement failure
      return new NotFoundError('Resource', 'requested');
    case '42P01': // undefined_table
    case '42703': // undefined_column
      return new RepositoryError(`Schema mismatch: ${message}`, 'SCHEMA_ERROR', 500, error);
    default:
      if (message.includes('fetch') || code === 'ECONNREFUSED') {
        return new DatabaseConnectionError(error);
      }
      return new RepositoryError(message, code, 500, error);
  }
}
