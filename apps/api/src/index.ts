import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { createApplicationsRouter } from "./routes/applications.js";
import { createHealthRouter } from "./routes/health.js";
import path from "node:path";
import { HttpError } from "./lib/errors.js";
import { config } from "./config.js";

const app = express();

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});

const prisma = new PrismaClient({ adapter });

app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());

app.use("/api/health", createHealthRouter());
app.use("/api/applications", createApplicationsRouter(prisma));

const staticDir = config.staticDir;

if (staticDir) {
  app.use(express.static(staticDir));

  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
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

const server = app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});

let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received, shutting down gracefully...`);

  server.close(async closeError => {
    if (closeError) {
      console.error("Failed to close HTTP server cleanly.", closeError);
      process.exitCode = 1;
    }

    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Failed to disconnect Prisma cleanly.", disconnectError);
      process.exitCode = 1;
    } finally {
      process.exit();
    }
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
