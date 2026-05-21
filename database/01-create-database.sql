-- =====================================================================
--  Aurelia Hotel — initial database creation
--  Run this in SSMS once, connected to your SQL Server instance.
--  After this, the Prisma migrations (`npm run prisma:push` from the
--  backend folder) will create the actual tables.
-- =====================================================================

USE master;
GO

IF DB_ID('LuxuryHotelDB') IS NULL
BEGIN
    PRINT 'Creating database LuxuryHotelDB...';
    CREATE DATABASE LuxuryHotelDB;
END
ELSE
BEGIN
    PRINT 'Database LuxuryHotelDB already exists — skipping.';
END
GO

-- Make the DB use a sane default collation + recovery model for dev
ALTER DATABASE LuxuryHotelDB SET RECOVERY SIMPLE;
GO

PRINT 'Done. You can now run `npm run db:setup` from the backend folder.';
GO
