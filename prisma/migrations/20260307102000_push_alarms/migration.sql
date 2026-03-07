-- Alter Transfer for push alarm scheduling
ALTER TABLE "Transfer"
ADD COLUMN "datumVrijemeUtc" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
ADD COLUMN "alarmEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "alarmSentAt" TIMESTAMP(3);

CREATE INDEX "Transfer_datumVrijemeUtc_alarmSentAt_idx"
ON "Transfer"("datumVrijemeUtc", "alarmSentAt");

-- Backfill existing rows with a combined UTC timestamp
UPDATE "Transfer"
SET "datumVrijemeUtc" =
  date_trunc('day', "datum") +
  make_interval(
    hours => EXTRACT(HOUR FROM "vrijeme")::int,
    mins => EXTRACT(MINUTE FROM "vrijeme")::int,
    secs => EXTRACT(SECOND FROM "vrijeme")::double precision
  );

-- Alter ArhivaTransfera for restore consistency
ALTER TABLE "ArhivaTransfera"
ADD COLUMN "datumVrijemeUtc" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
ADD COLUMN "alarmEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "alarmSentAt" TIMESTAMP(3);

UPDATE "ArhivaTransfera"
SET "datumVrijemeUtc" =
  date_trunc('day', "datum") +
  make_interval(
    hours => EXTRACT(HOUR FROM "vrijeme")::int,
    mins => EXTRACT(MINUTE FROM "vrijeme")::int,
    secs => EXTRACT(SECOND FROM "vrijeme")::double precision
  );

-- Store browser push subscriptions
CREATE TABLE "PushSubscription" (
  "id" TEXT NOT NULL,
  "userKey" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "p256dhKey" TEXT NOT NULL,
  "authKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_userKey_idx" ON "PushSubscription"("userKey");
