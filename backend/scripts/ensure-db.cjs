const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

function getDatabaseName(databaseUrl) {
  const parts = String(databaseUrl || "").split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    const match = /^database\s*=\s*(.+)$/i.exec(trimmed);
    if (match && match[1]) return match[1].trim();
  }
  return process.env.DB_NAME || "LuxuryHotelDB";
}

function toMasterUrl(databaseUrl) {
  if (!databaseUrl || typeof databaseUrl !== "string") {
    throw new Error("DATABASE_URL is required");
  }

  const parts = databaseUrl.split(";");
  let found = false;

  const updated = parts.map((part) => {
    const trimmed = part.trim();
    if (/^database\s*=/i.test(trimmed)) {
      found = true;
      return "database=master";
    }
    return part;
  });

  if (!found) updated.push("database=master");
  return updated.join(";");
}

const masterDbUrl = toMasterUrl(process.env.DATABASE_URL);
const dbName = getDatabaseName(process.env.DATABASE_URL);
const p = new PrismaClient({
  datasources: {
    db: {
      url: masterDbUrl
    }
  }
});
(async () => {
  try {
    await p.$executeRawUnsafe(`IF DB_ID('${dbName}') IS NULL CREATE DATABASE [${dbName}]`);
    console.log(`${dbName} ensured`);
  } catch (e) {
    console.error("ERR", e.message);
    process.exit(1);
  } finally {
    await p.$disconnect();
  }
})();
