/**
 * Centralized API Client utility.
 * 
 * Enforces the API versioning strategy and provides standard
 * error handling for all frontend fetches.
 */

const API_VERSION = 'v1';
const BASE_PATH = `/api/${API_VERSION}`;

import { createLogger } from '@maison/shared';
const logger = createLogger('api.client');

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * Standard fetch wrapper for Maison Slimani API.
 * Automatically prepends the current API version.
 */
export async function apiFetch<T>(
  path: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  // Ensure path starts with / but not duplicated
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE_PATH}${cleanPath}`;

  try {
    const response = await fetch(url, options);
    
    // Handle non-JSON or error status
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `API Error (${response.status}): ${errorText || response.statusText}` 
      };
    }

    return await response.json();
  } catch (error) {
    logger.error(`Fetch error for ${url}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown network error' 
    };
  }
}

/**
 * Endpoint constants to avoid magic strings throughout the app.
 */
export const ENDPOINTS = {
  SETTINGS: '/settings',
  CATEGORIES: '/categories',
  PRODUITS: '/produits',
  CONTACT: '/contact',
  ORDRES: '/commandes',
  COMMENTAIRES: '/commentaires',
} as const;
