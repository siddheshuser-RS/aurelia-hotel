import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[aurelia] API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    // eslint-disable-next-line no-console
    console.error(`[aurelia] port ${env.port} is already in use. Stop the existing process or set a different PORT.`);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.error("[aurelia] server failed to start:", error.message);
  process.exit(1);
});

async function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\n[aurelia] received ${signal}, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("[aurelia] unhandledRejection:", reason);
});
