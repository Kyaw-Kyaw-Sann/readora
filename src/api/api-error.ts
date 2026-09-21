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

    if (!error.response) {
      const connectionMessage = error.code === 'ECONNABORTED'
        ? 'The Readora server took too long to respond. Please try again.'
        : 'Cannot connect to the Readora server. Check your network and API address.';

      return new ApiError(connectionMessage);
    }

    return new ApiError(
      message ?? error.message ?? 'Something went wrong. Please try again.',
      error.response?.status,
    );
  }

  return new ApiError('Something went wrong. Please try again.');
}
