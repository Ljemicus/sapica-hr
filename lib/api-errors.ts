import { NextResponse } from 'next/server';

interface ErrorResponseOptions {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export function apiError(options: ErrorResponseOptions) {
  const { status, code, message, details } = options;

  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status }
  );
}
