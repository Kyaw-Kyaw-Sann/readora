import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { Category } from '@/types/category.types';
import type { ApiResponse } from '@/types/api.types';
import type { AuthUser } from '@/types/auth.types';

export interface UpdateProfileRequest {
  name: string;
  profileImageUrl?: string | null;
}

export async function getCurrentUser() {
  return getResponseData(await apiClient.get<ApiResponse<AuthUser>>('/api/users/me'));
}

export async function updateCurrentUser(request: UpdateProfileRequest) {
  return getResponseData(await apiClient.put<ApiResponse<AuthUser>>('/api/users/me', request));
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return getResponseData(await apiClient.put<ApiResponse<null>>('/api/users/me/password', { currentPassword, newPassword }));
}

export async function getUserInterests() {
  return getResponseData(await apiClient.get<ApiResponse<Category[]>>('/api/users/me/interests'));
}

export async function updateUserInterests(categoryIds: number[]) {
  return getResponseData(await apiClient.put<ApiResponse<Category[]>>('/api/users/me/interests', { categoryIds }));
}
