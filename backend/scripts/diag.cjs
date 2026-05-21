const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const p = new PrismaClient();
(async () => {
  try {
    const info = await p.$queryRawUnsafe(
      "SELECT @@SERVERNAME AS server, DB_NAME() AS db, SUSER_NAME() AS user_name"
    );
    console.log("Connected to:", info);
    const tables = await p.$queryRawUnsafe(
      "SELECT name FROM sys.tables ORDER BY name"
    );
    console.log("Tables:", tables);
  } catch (e) {
    console.error("ERR", e.message);
  } finally {
    await p.$disconnect();
  }
})();
