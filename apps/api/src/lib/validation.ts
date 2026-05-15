import { type ZodType, type infer as ZodInfer } from "zod";
import { BadRequestError } from "./errors.js";

export function parseBody<TSchema extends ZodType>(
  schema: TSchema,
  body: unknown,
): ZodInfer<TSchema> {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new BadRequestError("Invalid request body", result.error.issues);
  }

  return result.data;
}
