type LoadErrorMessages = {
  fallbackMessage: string;
  notFoundMessage: string;
  networkMessage: string;
};

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

export function isAbortError(error: unknown) {
  return (
    error instanceof DOMException && error.name === "AbortError"
  );
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong.",
) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export function getLoadErrorMessage(
  error: unknown,
  {
    fallbackMessage,
    notFoundMessage,
    networkMessage,
  }: LoadErrorMessages,
) {
  if (isApiRequestError(error)) {
    if (error.status === 404) {
      return notFoundMessage;
    }

    return error.message || fallbackMessage;
  }

  if (error instanceof TypeError) {
    return networkMessage;
  }

  return getErrorMessage(error, fallbackMessage);
}
