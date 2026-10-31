import { config, requireApiBaseUrl } from '../config';

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface JsonRequestOptions extends RequestInit {
  timeoutMs?: number;
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function buildApiUrl(path: string): string {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const baseUrl = requireApiBaseUrl('This service');
  return `${baseUrl}/${path.replace(/^\//, '')}`;
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null) {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message;
    }
    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error;
    }
  }

  return fallback;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || undefined;
}

export async function requestJson<T>(
  path: string,
  options: JsonRequestOptions = {}
): Promise<T> {
  return requestWithBody(path, options, async response => parseResponseBody(response) as Promise<T>);
}

export async function requestBytes(
  path: string,
  options: JsonRequestOptions = {}
): Promise<Uint8Array> {
  return requestWithBody(path, options, async response => {
    return new Uint8Array(await response.arrayBuffer());
  });
}

async function requestWithBody<T>(
  path: string,
  options: JsonRequestOptions,
  readSuccessBody: (response: Response) => Promise<T>
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? config.services.requestTimeoutMs;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(buildApiUrl(path), {
      ...options,
      headers,
      signal: controller.signal,
    });
    if (!response.ok) {
      const payload = await parseResponseBody(response);
      throw new HttpError(
        getErrorMessage(payload, `Request failed with status ${response.status}.`),
        response.status,
        payload
      );
    }
    return readSuccessBody(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs} ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
