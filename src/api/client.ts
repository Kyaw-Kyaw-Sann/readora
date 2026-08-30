import { create, type InternalAxiosRequestConfig } from 'axios';

import { ApiError, normalizeApiError } from '@/api/api-error';
import { environment, hasApiBaseUrl } from '@/constants/env';
import { clearTokens, getAccessToken, getStoredRefreshToken, replaceAccessToken } from '@/lib/token-storage';
import type { ApiResponse } from '@/types/api.types';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshPayload {
  accessToken: string;
}

export const apiClient = create({
  baseURL: environment.apiBaseUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient = create({
  baseURL: environment.apiBaseUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.request.use((config) => {
  if (!hasApiBaseUrl()) {
    return Promise.reject(new ApiError('EXPO_PUBLIC_API_BASE_URL is not configured.'));
  }

  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const originalRequest = (error as { config?: RetriableRequestConfig }).config;
    const status = (error as { response?: { status?: number } }).response?.status;

    const isAuthRequest = originalRequest?.url?.startsWith('/api/auth/');

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest) {
      return Promise.reject(normalizeApiError(error));
    }

    originalRequest._retry = true;

    try {
      const nextAccessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      await clearTokens();
      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function requestTokenRefresh() {
  const refreshToken = await getStoredRefreshToken();

  if (!refreshToken) {
    throw new ApiError('Your session has expired. Please sign in again.', 401);
  }

  try {
    const response = await refreshClient.post<ApiResponse<RefreshPayload>>('/api/auth/refresh', {
      refreshToken,
    });

    await replaceAccessToken(response.data.data.accessToken);
    return response.data.data.accessToken;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
