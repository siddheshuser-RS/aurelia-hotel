-- =====================================================================
--  Aurelia Hotel — handy admin queries (run in SSMS against LuxuryHotelDB)
-- =====================================================================

USE LuxuryHotelDB;
GO

-- Quick health: row counts per table
SELECT 'User'        AS table_name, COUNT(*) AS rows FROM dbo.[User]
UNION ALL SELECT 'Room',         COUNT(*) FROM dbo.Room
UNION ALL SELECT 'Booking',      COUNT(*) FROM dbo.Booking
UNION ALL SELECT 'Testimonial',  COUNT(*) FROM dbo.Testimonial
UNION ALL SELECT 'Gallery',      COUNT(*) FROM dbo.Gallery;

-- Latest 20 bookings
SELECT TOP 20
    b.id, b.guestName, b.guestEmail, b.status,
    r.title AS room, b.checkIn, b.checkOut, b.guests, b.totalPrice, b.createdAt
FROM dbo.Booking b
LEFT JOIN dbo.Room r ON r.id = b.roomId
ORDER BY b.createdAt DESC;

-- Pending testimonials waiting for moderation
SELECT id, name, rating, message, createdAt
FROM dbo.Testimonial
WHERE approved = 0
ORDER BY createdAt DESC;

-- Occupancy windows for a single room (replace the slug)
DECLARE @slug NVARCHAR(120) = N'royal-sky-suite';

SELECT
    r.title,
    b.guestName,
    b.checkIn,
    b.checkOut,
    b.status
FROM dbo.Booking b
JOIN dbo.Room r ON r.id = b.roomId
WHERE r.slug = @slug
  AND b.status IN ('PENDING','CONFIRMED')
ORDER BY b.checkIn;
