const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const environment = {
  apiBaseUrl: rawApiBaseUrl?.replace(/\/$/, '') ?? '',
};

export function hasApiBaseUrl() {
  return environment.apiBaseUrl.length > 0;
}
