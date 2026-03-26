export class LeadMagicError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'LeadMagicError';
  }
}

export class AuthError extends LeadMagicError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class InsufficientCreditsError extends LeadMagicError {
  constructor(message = 'Insufficient credits') {
    super(message, 'INSUFFICIENT_CREDITS', 402);
    this.name = 'InsufficientCreditsError';
  }
}

export class NotFoundError extends LeadMagicError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends LeadMagicError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends LeadMagicError {
  constructor(
    message = 'Rate limit exceeded',
    public retryAfterSeconds?: number,
  ) {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

export class ServerError extends LeadMagicError {
  constructor(message: string, statusCode = 500) {
    super(message, 'SERVER_ERROR', statusCode);
    this.name = 'ServerError';
  }
}

export class NetworkError extends LeadMagicError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends LeadMagicError {
  constructor(message = 'Request timed out') {
    super(message, 'TIMEOUT');
    this.name = 'TimeoutError';
  }
}

export function formatError(error: unknown): { message: string; code: string } {
  if (error instanceof LeadMagicError) {
    return { message: error.message, code: error.code };
  }
  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.message.includes('aborted')) {
      return { message: 'Request timed out', code: 'TIMEOUT' };
    }
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return { message: `Network error: ${error.message}`, code: 'NETWORK_ERROR' };
    }
    return { message: error.message, code: 'UNKNOWN_ERROR' };
  }
  return { message: String(error), code: 'UNKNOWN_ERROR' };
}
