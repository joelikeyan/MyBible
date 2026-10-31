const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

export class ServiceConfigurationError extends Error {
  constructor(feature: string) {
    super(`${feature} requires EXPO_PUBLIC_MYBIBLE_API_URL to point to the MyBible API.`);
    this.name = 'ServiceConfigurationError';
  }
}

export function normalizeBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export const config = {
  services: {
    apiBaseUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_MYBIBLE_API_URL),
    requestTimeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
  },
} as const;

export function requireApiBaseUrl(feature: string): string {
  if (!config.services.apiBaseUrl) {
    throw new ServiceConfigurationError(feature);
  }

  return config.services.apiBaseUrl;
}
