import { afterEach } from "node:test";
import { type AddressInfo } from "node:net";
import { type PrismaClient } from "../generated/prisma/client.js";
import { createApp } from "../app.js";

export function createPrismaMock(overrides: Record<string, unknown>) {
  return overrides as unknown as PrismaClient;
}

const openServers = new Set<{ close: (cb: (err?: Error) => void) => void }>();

afterEach(async () => {
  await Promise.all(
    [...openServers].map(
      server =>
        new Promise<void>((resolve, reject) => {
          server.close(error => {
            if (error) {
              reject(error);
              return;
            }

            openServers.delete(server);
            resolve();
          });
        }),
    ),
  );
});

export async function startTestServer(prisma: PrismaClient) {
  const app = createApp(prisma, {
    corsOrigins: ["http://localhost:5173"],
  });
  const server = app.listen(0);
  openServers.add(server);

  await new Promise<void>((resolve, reject) => {
    server.once("listening", () => resolve());
    server.once("error", reject);
  });

  const { port } = server.address() as AddressInfo;

  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
  };
}
