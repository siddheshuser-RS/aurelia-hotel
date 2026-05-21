-- Run this script in SSMS before Prisma migration (adjust password policy as needed)
IF DB_ID('LuxuryHotelDB') IS NULL
BEGIN
  CREATE DATABASE LuxuryHotelDB;
END
GO

USE LuxuryHotelDB;
GO

-- Optional: create dedicated SQL login/user in local SQL Server
-- CREATE LOGIN luxury_hotel_user WITH PASSWORD = 'StrongP@ssw0rd!';
-- CREATE USER luxury_hotel_user FOR LOGIN luxury_hotel_user;
-- EXEC sp_addrolemember 'db_owner', 'luxury_hotel_user';
