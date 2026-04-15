import { NextResponse } from 'next/server';
import { z } from 'zod';
import { RepositoryError } from '@maison/db';
import { createLogger } from '@maison/shared';

const logger = createLogger('api.handler');

/**
 * Standardized API Response format
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  details?: Record<string, string[] | undefined>;
}

type ParamsRecord = Record<string, string | string[]>;

/**
 * Higher Order Function to wrap Next.js API routes with standard error handling
 * and validation support.
 */
export function createApiHandler<T, P = ParamsRecord>(
  handler: (req: Request, context: { params: Promise<P> }, requestId: string) => Promise<T | NextResponse<ApiResponse<T>>>
) {
  return async (req: Request, context: { params: Promise<P> }): Promise<NextResponse<ApiResponse<T>>> => {
    const requestId = crypto.randomUUID();
    
    try {
      const result = await handler(req, context, requestId);

      // If handler already returns a NextResponse, return it as is
      if (result instanceof NextResponse) {
        result.headers.set('X-Request-Id', requestId);
        return result as unknown as NextResponse<ApiResponse<T>>;
      }

      // Otherwise wrap the result in our standard envelope
      const response = NextResponse.json({ data: result });
      response.headers.set('X-Request-Id', requestId);
      return response;
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      // Log for observability
      logger.error(`[API Error] ${req.method} ${req.url}:`, err, {
        method: req.method,
        url: req.url,
        requestId
      });

      // Handle Standardized Repository Errors
      if (error instanceof RepositoryError) {
        const errResp = NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
        errResp.headers.set('X-Request-Id', requestId);
        return errResp as NextResponse<ApiResponse<T>>;
      }

      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const errResp = NextResponse.json(
          { 
            error: 'Erreur de validation', 
            details: error.flatten().fieldErrors 
          },
          { status: 400 }
        );
        errResp.headers.set('X-Request-Id', requestId);
        return errResp;
      }

      // Handle other errors
      const status = typeof err.status === 'number' ? err.status : 500;
      const message = typeof err.message === 'string' ? err.message : 'Une erreur inattendue est survenue';

      const errResp = NextResponse.json(
        { error: message },
        { status }
      );
      errResp.headers.set('X-Request-Id', requestId);
      return errResp as NextResponse<ApiResponse<T>>;
    }
  };
}
