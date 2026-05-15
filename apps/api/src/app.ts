import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import path from "node:path";
import { type PrismaClient } from "./generated/prisma/client.js";
import { createApplicationsRouter } from "./routes/applications.js";
import { createHealthRouter } from "./routes/health.js";
import { HttpError } from "./lib/errors.js";

type AppOptions = {
  corsOrigins: string[];
  staticDir?: string | undefined;
};

export function createApp(prisma: PrismaClient, options: AppOptions) {
  const app = express();

  app.use(cors({ origin: options.corsOrigins }));
  app.use(express.json());

  app.use("/api/health", createHealthRouter());
  app.use("/api/applications", createApplicationsRouter(prisma));

  if (options.staticDir) {
    app.use(express.static(options.staticDir));

    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(options.staticDir!, "index.html"));
    });
  }

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        error: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      });
      return;
    }

    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  };

  app.use(errorHandler);

  return app;
}
