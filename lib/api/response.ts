import { NextResponse } from 'next/server'

export function successResponse<T>(
  data: T,
  init?: ResponseInit
) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    init
  )
}

export function createdResponse<T>(data: T) {
  return successResponse(data, { status: 201 })
}

export function errorResponse(
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    },
    { status }
  )
}

