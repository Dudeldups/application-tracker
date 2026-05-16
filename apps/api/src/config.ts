import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.url("DATABASE_URL must be a valid database connection URL."),
  DEMO_MODE: z
    .string()
    .optional()
    .transform(value => {
      if (!value) {
        return false;
      }

      return ["1", "true", "yes", "on"].includes(value.toLowerCase());
    }),
  PORT: z
    .string()
    .optional()
    .transform(value => {
      if (!value) {
        return 3001;
      }

      const port = Number(value);

      if (!Number.isInteger(port) || port <= 0) {
        throw new Error("PORT must be a positive integer.");
      }

      return port;
    }),
  CORS_ORIGIN: z
    .string()
    .optional()
    .transform(value =>
      value
        ? value
            .split(",")
            .map(origin => origin.trim())
            .filter(Boolean)
        : ["http://localhost:5173"],
    ),
  STATIC_DIR: z.string().trim().min(1).optional(),
});

const env = envSchema.parse(process.env);

export const config = {
  databaseUrl: env.DATABASE_URL,
  demoMode: env.DEMO_MODE,
  port: env.PORT,
  corsOrigins: env.CORS_ORIGIN,
  staticDir: env.STATIC_DIR,
};
