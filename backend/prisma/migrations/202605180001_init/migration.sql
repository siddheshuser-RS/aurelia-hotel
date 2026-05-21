BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'GUEST',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Room] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [price] DECIMAL(10,2) NOT NULL,
    [capacity] INT NOT NULL,
    [images] NVARCHAR(max) NOT NULL,
    [amenities] NVARCHAR(max) NOT NULL,
    [active] BIT NOT NULL CONSTRAINT [Room_active_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Room_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Room_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Room_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[Booking] (
    [id] NVARCHAR(1000) NOT NULL,
    [guestName] NVARCHAR(1000) NOT NULL,
    [guestEmail] NVARCHAR(1000) NOT NULL,
    [guestPhone] NVARCHAR(1000),
    [notes] NVARCHAR(max),
    [userId] NVARCHAR(1000),
    [roomId] NVARCHAR(1000) NOT NULL,
    [checkIn] DATETIME2 NOT NULL,
    [checkOut] DATETIME2 NOT NULL,
    [guests] INT NOT NULL,
    [totalPrice] DECIMAL(10,2) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Booking_status_df] DEFAULT 'PENDING',
    [paymentStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [Booking_paymentStatus_df] DEFAULT 'UNPAID',
    [source] NVARCHAR(1000) NOT NULL CONSTRAINT [Booking_source_df] DEFAULT 'WEB',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Booking_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Booking_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[BookingRoom] (
    [id] NVARCHAR(1000) NOT NULL,
    [bookingId] NVARCHAR(1000) NOT NULL,
    [roomId] NVARCHAR(1000) NOT NULL,
    [checkIn] DATETIME2 NOT NULL,
    [checkOut] DATETIME2 NOT NULL,
    [guests] INT NOT NULL,
    [nightlyRate] DECIMAL(10,2) NOT NULL,
    [subtotal] DECIMAL(10,2) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [BookingRoom_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [BookingRoom_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PricingRule] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [roomId] NVARCHAR(1000),
    [strategy] NVARCHAR(1000) NOT NULL,
    [adjustmentType] NVARCHAR(1000) NOT NULL CONSTRAINT [PricingRule_adjustmentType_df] DEFAULT 'PERCENT',
    [adjustment] DECIMAL(10,2) NOT NULL,
    [priority] INT NOT NULL CONSTRAINT [PricingRule_priority_df] DEFAULT 100,
    [active] BIT NOT NULL CONSTRAINT [PricingRule_active_df] DEFAULT 1,
    [startsAt] DATETIME2 NOT NULL,
    [endsAt] DATETIME2 NOT NULL,
    [daysOfWeek] NVARCHAR(max),
    [minNights] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PricingRule_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PricingRule_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RoomInventoryDay] (
    [id] NVARCHAR(1000) NOT NULL,
    [roomId] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [blocked] BIT NOT NULL CONSTRAINT [RoomInventoryDay_blocked_df] DEFAULT 0,
    [maxOccupancy] INT,
    [overridePrice] DECIMAL(10,2),
    [note] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RoomInventoryDay_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [RoomInventoryDay_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RoomInventoryDay_roomId_date_key] UNIQUE NONCLUSTERED ([roomId],[date])
);

-- CreateTable
CREATE TABLE [dbo].[Payment] (
    [id] NVARCHAR(1000) NOT NULL,
    [bookingId] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [providerPaymentId] NVARCHAR(1000),
    [amount] DECIMAL(10,2) NOT NULL,
    [currency] NVARCHAR(1000) NOT NULL CONSTRAINT [Payment_currency_df] DEFAULT 'USD',
    [status] NVARCHAR(1000) NOT NULL,
    [paidAt] DATETIME2,
    [metadata] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Payment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Payment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ConciergeRequest] (
    [id] NVARCHAR(1000) NOT NULL,
    [bookingId] NVARCHAR(1000),
    [userId] NVARCHAR(1000),
    [guestName] NVARCHAR(1000) NOT NULL,
    [guestEmail] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [details] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [ConciergeRequest_status_df] DEFAULT 'OPEN',
    [assignedTo] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ConciergeRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ConciergeRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AuditLog] (
    [id] NVARCHAR(1000) NOT NULL,
    [actorUserId] NVARCHAR(1000),
    [action] NVARCHAR(1000) NOT NULL,
    [entityType] NVARCHAR(1000) NOT NULL,
    [entityId] NVARCHAR(1000) NOT NULL,
    [before] NVARCHAR(max),
    [after] NVARCHAR(max),
    [metadata] NVARCHAR(max),
    [bookingId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AuditLog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AuditLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[NotificationEvent] (
    [id] NVARCHAR(1000) NOT NULL,
    [channel] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [NotificationEvent_status_df] DEFAULT 'PENDING',
    [recipient] NVARCHAR(1000),
    [payload] NVARCHAR(max) NOT NULL,
    [processedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [NotificationEvent_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [NotificationEvent_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Testimonial] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [image] NVARCHAR(1000) NOT NULL,
    [rating] INT NOT NULL,
    [message] NVARCHAR(max) NOT NULL,
    [approved] BIT NOT NULL CONSTRAINT [Testimonial_approved_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Testimonial_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Testimonial_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Gallery] (
    [id] NVARCHAR(1000) NOT NULL,
    [imageUrl] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [caption] NVARCHAR(1000),
    [position] INT NOT NULL CONSTRAINT [Gallery_position_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Gallery_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Gallery_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ContactInquiry] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000),
    [subject] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(max) NOT NULL,
    [read] BIT NOT NULL CONSTRAINT [ContactInquiry_read_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ContactInquiry_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ContactInquiry_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Room_active_idx] ON [dbo].[Room]([active]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Booking_roomId_checkIn_checkOut_status_idx] ON [dbo].[Booking]([roomId], [checkIn], [checkOut], [status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Booking_guestEmail_idx] ON [dbo].[Booking]([guestEmail]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Booking_status_idx] ON [dbo].[Booking]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Booking_paymentStatus_idx] ON [dbo].[Booking]([paymentStatus]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [BookingRoom_bookingId_idx] ON [dbo].[BookingRoom]([bookingId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [BookingRoom_roomId_checkIn_checkOut_idx] ON [dbo].[BookingRoom]([roomId], [checkIn], [checkOut]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PricingRule_roomId_active_startsAt_endsAt_idx] ON [dbo].[PricingRule]([roomId], [active], [startsAt], [endsAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PricingRule_strategy_active_idx] ON [dbo].[PricingRule]([strategy], [active]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RoomInventoryDay_date_blocked_idx] ON [dbo].[RoomInventoryDay]([date], [blocked]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Payment_bookingId_status_idx] ON [dbo].[Payment]([bookingId], [status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ConciergeRequest_status_createdAt_idx] ON [dbo].[ConciergeRequest]([status], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ConciergeRequest_bookingId_idx] ON [dbo].[ConciergeRequest]([bookingId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_entityType_entityId_idx] ON [dbo].[AuditLog]([entityType], [entityId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_actorUserId_createdAt_idx] ON [dbo].[AuditLog]([actorUserId], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [NotificationEvent_status_createdAt_idx] ON [dbo].[NotificationEvent]([status], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [NotificationEvent_type_idx] ON [dbo].[NotificationEvent]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Testimonial_approved_idx] ON [dbo].[Testimonial]([approved]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Gallery_category_idx] ON [dbo].[Gallery]([category]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ContactInquiry_read_idx] ON [dbo].[ContactInquiry]([read]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ContactInquiry_createdAt_idx] ON [dbo].[ContactInquiry]([createdAt]);

-- AddForeignKey
ALTER TABLE [dbo].[Booking] ADD CONSTRAINT [Booking_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Booking] ADD CONSTRAINT [Booking_roomId_fkey] FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[BookingRoom] ADD CONSTRAINT [BookingRoom_bookingId_fkey] FOREIGN KEY ([bookingId]) REFERENCES [dbo].[Booking]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[BookingRoom] ADD CONSTRAINT [BookingRoom_roomId_fkey] FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PricingRule] ADD CONSTRAINT [PricingRule_roomId_fkey] FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RoomInventoryDay] ADD CONSTRAINT [RoomInventoryDay_roomId_fkey] FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [Payment_bookingId_fkey] FOREIGN KEY ([bookingId]) REFERENCES [dbo].[Booking]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ConciergeRequest] ADD CONSTRAINT [ConciergeRequest_bookingId_fkey] FOREIGN KEY ([bookingId]) REFERENCES [dbo].[Booking]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ConciergeRequest] ADD CONSTRAINT [ConciergeRequest_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AuditLog] ADD CONSTRAINT [AuditLog_actorUserId_fkey] FOREIGN KEY ([actorUserId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AuditLog] ADD CONSTRAINT [AuditLog_bookingId_fkey] FOREIGN KEY ([bookingId]) REFERENCES [dbo].[Booking]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

