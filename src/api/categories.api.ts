import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { Category } from '@/types/category.types';
import type { ApiResponse } from '@/types/api.types';

export async function getCategories() {
  return getResponseData(await apiClient.get<ApiResponse<Category[]>>('/api/categories'));
}

export async function getCategory(categoryId: number) {
  return getResponseData(await apiClient.get<ApiResponse<Category>>(`/api/categories/${categoryId}`));
}
