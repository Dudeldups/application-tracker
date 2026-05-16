import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { config } from "../config.js";
import { resetDemoState } from "../lib/demo-state.js";

async function main() {
  if (!config.demoMode) {
    throw new Error(
      "Refusing to reset data because DEMO_MODE is not enabled for this API environment.",
    );
  }

  const adapter = new PrismaPg({
    connectionString: config.databaseUrl,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const applications = await resetDemoState(prisma);
    console.log(`Demo reset complete. Seeded ${applications.length} applications.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
