import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Requête invalide', details?: unknown) {
    super(message, 400, details)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Non autorisé') {
    super(message, 401)
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Ressource introuvable') {
    super(message, 404)
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.details,
      },
      { status: error.status }
    )
  }

  console.error('Erreur serveur inattendue:', error)

  return NextResponse.json(
    {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erreur interne du serveur',
    },
    { status: 500 }
  )
}

