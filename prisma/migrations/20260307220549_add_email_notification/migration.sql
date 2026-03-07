-- AlterTable
ALTER TABLE "ArhivaTransfera" ADD COLUMN     "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailSentAt" TIMESTAMP(3),
ALTER COLUMN "datumVrijemeUtc" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailSentAt" TIMESTAMP(3),
ALTER COLUMN "datumVrijemeUtc" DROP DEFAULT;
