const { execSync } = require("node:child_process");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const INITIAL_MIGRATION = "202605180001_init";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

async function needsBaseline(prisma) {
  const migrationsTable = await prisma.$queryRawUnsafe(`
    SELECT COUNT(1) AS c
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = '_prisma_migrations'
  `);
  const hasMigrationsTable = Number(migrationsTable?.[0]?.c || 0) > 0;

  const userTables = await prisma.$queryRawUnsafe(`
    SELECT COUNT(1) AS c
    FROM sys.tables
    WHERE name <> '_prisma_migrations'
  `);
  const hasUserTables = Number(userTables?.[0]?.c || 0) > 0;

  if (!hasUserTables) return false;
  if (!hasMigrationsTable) return true;

  const applied = await prisma.$queryRawUnsafe(
    `SELECT COUNT(1) AS c FROM dbo._prisma_migrations WHERE migration_name = '${INITIAL_MIGRATION}'`
  );
  return Number(applied?.[0]?.c || 0) === 0;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  // Ensure target database exists before migration operations.
  run("node scripts/ensure-db.cjs");

  const prisma = new PrismaClient();
  try {
    if (await needsBaseline(prisma)) {
      console.log(`[db-prepare] existing schema detected, baselining ${INITIAL_MIGRATION}`);
      run(`npx prisma migrate resolve --applied ${INITIAL_MIGRATION}`);
    }
  } finally {
    await prisma.$disconnect();
  }

  run("npx prisma migrate deploy");
  console.log("[db-prepare] migration state is ready");
}

main().catch((error) => {
  console.error("[db-prepare] failed:", error.message || error);
  process.exit(1);
});
