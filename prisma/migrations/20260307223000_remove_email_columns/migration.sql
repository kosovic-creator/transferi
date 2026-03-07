-- AlterTable
ALTER TABLE "ArhivaTransfera"
  DROP COLUMN IF EXISTS "emailEnabled",
  DROP COLUMN IF EXISTS "emailSentAt",
  DROP COLUMN IF EXISTS "notificationEmail";

-- AlterTable
ALTER TABLE "Transfer"
  DROP COLUMN IF EXISTS "emailEnabled",
  DROP COLUMN IF EXISTS "emailSentAt",
  DROP COLUMN IF EXISTS "notificationEmail";
