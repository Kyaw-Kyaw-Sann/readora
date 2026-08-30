import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function normalizeApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const message = (error.response?.data as ErrorResponse | undefined)?.message;

    return new ApiError(
      message ?? error.message ?? 'Something went wrong. Please try again.',
      error.response?.status,
    );
  }

  return new ApiError('Something went wrong. Please try again.');
}
