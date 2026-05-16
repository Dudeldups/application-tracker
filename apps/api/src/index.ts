import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "./config.js";
import { createApp } from "./app.js";

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});

const prisma = new PrismaClient({ adapter });
const app = createApp(prisma, {
  corsOrigins: config.corsOrigins,
  demoMode: config.demoMode,
  staticDir: config.staticDir,
});

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
