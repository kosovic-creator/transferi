-- CreateEnum
CREATE TYPE "Relacija" AS ENUM ('apartman-aerodrom', 'aerodrom-apartman');

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "relacija" "Relacija" NOT NULL,
    "ostaleRelacije" TEXT,
    "iznos" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "datum" DATE NOT NULL,
    "vrijeme" TIME(0) NOT NULL,
    "korisnik" TEXT,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArhivaTransfera" (
    "id" TEXT NOT NULL,
    "relacija" "Relacija" NOT NULL,
    "ostaleRelacije" TEXT,
    "iznos" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "datum" DATE NOT NULL,
    "vrijeme" TIME(0) NOT NULL,
    "korisnik" TEXT,

    CONSTRAINT "ArhivaTransfera_pkey" PRIMARY KEY ("id")
);
