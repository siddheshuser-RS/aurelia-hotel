const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config();

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

// Force connect to master to drop the stray tables that were created there
const p = new PrismaClient({
  datasources: {
    db: {
      url: masterDbUrl
    }
  }
});
(async () => {
  const drops = ["Booking", "Gallery", "Room", "Testimonial", "User", "_prisma_migrations"];
  for (const t of drops) {
    try {
      await p.$executeRawUnsafe(`IF OBJECT_ID('dbo.[${t}]','U') IS NOT NULL DROP TABLE dbo.[${t}]`);
      console.log("dropped", t);
    } catch (e) {
      console.log("skip", t, e.message);
    }
  }
  await p.$disconnect();
})();
