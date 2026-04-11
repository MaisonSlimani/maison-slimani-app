import { NextResponse } from 'next/server';
import { z } from 'zod';

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
  handler: (req: Request, context: { params: Promise<P> }) => Promise<T | NextResponse<ApiResponse<T>>>
) {
  return async (req: Request, context: { params: Promise<P> }): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      const result = await handler(req, context);

      // If handler already returns a NextResponse, return it as is
      if (result instanceof NextResponse) {
        return result as unknown as NextResponse<ApiResponse<T>>;
      }

      // Otherwise wrap the result in our standard envelope
      return NextResponse.json({ data: result });
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      // Log for observability
      console.error(`[API Error] ${req.method} ${req.url}:`, err);

      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation Error', 
            details: error.flatten().fieldErrors 
          },
          { status: 400 }
        );
      }

      // Handle common Supabase or Repository errors
      const status = typeof err.status === 'number' ? err.status : (err.code === 'PGRST116' ? 404 : 500);
      const message = typeof err.message === 'string' ? err.message : 'An unexpected error occurred';

      return NextResponse.json(
        { error: message },
        { status: status === 500 ? 500 : status }
      ) as NextResponse<ApiResponse<T>>;
    }
  };
}
