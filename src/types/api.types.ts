export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  last: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
