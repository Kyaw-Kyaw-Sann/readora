import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { ApiResponse } from '@/types/api.types';
import type { AuthTokens, AuthUser } from '@/types/auth.types';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData extends AuthTokens {
  user: AuthUser;
}

export async function register(request: RegisterRequest) {
  return getResponseData(await apiClient.post<ApiResponse<AuthUser>>('/api/auth/register', request));
}

export async function login(request: LoginRequest) {
  return getResponseData(await apiClient.post<ApiResponse<LoginData>>('/api/auth/login', request));
}

export async function signInWithGoogle(idToken: string) {
  return getResponseData(await apiClient.post<ApiResponse<LoginData>>('/api/auth/google', { idToken }));
}

export async function logout(refreshToken: string) {
  return getResponseData(await apiClient.post<ApiResponse<null>>('/api/auth/logout', { refreshToken }));
}

export async function verifyEmail(token: string) {
  return getResponseData(await apiClient.get<ApiResponse<null>>('/api/auth/verify-email', { params: { token } }));
}

export async function resendVerification(email: string) {
  return getResponseData(await apiClient.post<ApiResponse<null>>('/api/auth/resend-verification', { email }));
}

export async function requestPasswordReset(email: string) {
  return getResponseData(await apiClient.post<ApiResponse<null>>('/api/auth/forgot-password', { email }));
}

export async function verifyResetOtp(email: string, otp: string) {
  return getResponseData(await apiClient.post<ApiResponse<null>>('/api/auth/verify-reset-otp', { email, otp }));
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
  return getResponseData(await apiClient.post<ApiResponse<null>>('/api/auth/reset-password', { email, otp, newPassword }));
}
