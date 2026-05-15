import { Prisma } from "../generated/prisma/client.js";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
    this.name = "BadRequestError";
  }
}

export function isPrismaKnownRequestError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function mapPrismaError(
  error: unknown,
  messages: Partial<Record<"P2003" | "P2025", string>>,
) {
  if (!isPrismaKnownRequestError(error)) {
    return error;
  }

  const message = messages[error.code as "P2003" | "P2025"];

  if (message) {
    const statusCode = error.code === "P2025" ? 404 : 400;
    return new HttpError(statusCode, message);
  }

  return error;
}
