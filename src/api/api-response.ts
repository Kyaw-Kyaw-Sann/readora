import type { AxiosResponse } from 'axios';

import type { ApiResponse } from '@/types/api.types';

export function getResponseData<T>(response: AxiosResponse<ApiResponse<T>>) {
  return response.data.data;
}
