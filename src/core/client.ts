import {
  AuthError,
  InsufficientCreditsError,
  LeadMagicError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  ValidationError,
} from './errors.js';

import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
const { version: VERSION } = _require('../package.json') as { version: string };

const BASE_URL = 'https://api.leadmagic.io';
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export class LeadMagicClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? BASE_URL;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = new URL(this.baseUrl + options.path);

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      'X-API-Key': this.apiKey,
      'Accept': 'application/json',
      'User-Agent': `leadmagic-agent-cli/${VERSION}`,
    };

    if (options.body !== undefined && options.method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    let lastError: LeadMagicError | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url.toString(), {
          method: options.method,
          headers,
          body:
            options.body !== undefined && options.method !== 'GET'
              ? JSON.stringify(options.body)
              : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const text = await response.text();
          return text ? (JSON.parse(text) as T) : (undefined as T);
        }

        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch {
          // ignore
        }

        let errorMessage = errorBody;
        try {
          const parsed = JSON.parse(errorBody) as Record<string, unknown>;
          // LeadMagic RFC 9457 format: { errors: [{ title, code, ... }] }
          if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
            const first = parsed.errors[0] as Record<string, unknown>;
            if (typeof first.title === 'string') errorMessage = first.title;
            else if (typeof first.detail === 'string') errorMessage = first.detail;
          } else if (typeof parsed.detail === 'string') {
            errorMessage = parsed.detail;
          } else if (typeof parsed.title === 'string') {
            errorMessage = parsed.title;
          } else if (typeof parsed.message === 'string') {
            errorMessage = parsed.message;
          }
        } catch {
          // use raw body
        }

        switch (response.status) {
          case 401:
          case 403:
            throw new AuthError(errorMessage || 'Invalid or missing API key');

          case 402:
            throw new InsufficientCreditsError(
              errorMessage || 'Insufficient credits to complete this request',
            );

          case 404:
            throw new NotFoundError(errorMessage || 'Resource not found');

          case 400:
          case 422:
            throw new ValidationError(errorMessage || 'Invalid request parameters');

          case 429: {
            const retryAfter = parseInt(
              response.headers.get('RateLimit-Reset') ??
                response.headers.get('Retry-After') ??
                '',
              10,
            );
            const delayMs = !isNaN(retryAfter)
              ? retryAfter * 1000
              : Math.min(1000 * Math.pow(2, attempt), 60_000);

            if (attempt < this.maxRetries) {
              await sleep(delayMs);
              lastError = new RateLimitError(
                'Rate limit exceeded',
                Math.ceil(delayMs / 1000),
              );
              continue;
            }
            throw new RateLimitError('Rate limit exceeded', Math.ceil(delayMs / 1000));
          }

          default:
            if (response.status >= 500 && attempt < this.maxRetries) {
              await sleep(Math.min(1000 * Math.pow(2, attempt), 10_000));
              lastError = new ServerError(
                errorMessage || `Server error (${response.status})`,
                response.status,
              );
              continue;
            }
            throw new ServerError(
              errorMessage || `Server error (${response.status})`,
              response.status,
            );
        }
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof LeadMagicError) throw error;

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new TimeoutError(`Request to ${options.path} timed out after ${this.timeout}ms`);
          }
          if (
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('ENOTFOUND') ||
            error.message.includes('fetch failed')
          ) {
            if (attempt < this.maxRetries) {
              await sleep(Math.min(1000 * Math.pow(2, attempt), 5_000));
              lastError = new NetworkError(error.message);
              continue;
            }
            throw new NetworkError(error.message);
          }
        }

        throw new LeadMagicError(String(error), 'UNKNOWN_ERROR');
      }
    }

    throw lastError ?? new LeadMagicError('Request failed after retries', 'MAX_RETRIES');
  }

  async get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>({ method: 'GET', path, query });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }
}
