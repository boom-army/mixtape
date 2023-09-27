CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "NftTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "runtime" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "maxQuantity" INTEGER,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NftTemplate_pkey" PRIMARY KEY ("id")
);

-- Insert default rows
INSERT INTO "NftTemplate" ("id", "name", "runtime", "price", "image", "releaseDate", "endDate", "maxQuantity", "status", "createdAt", "updatedAt")
VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'MixtApe', 30, 0.1, '/images/mixtape-1024.png', '2023-09-08 00:00:00', NULL, NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('123e4567-e89b-12d3-a456-426614174001', 'Brite', 30, 0.1, '/images/mixtape-rainbow-1024.png', '2023-09-06 00:00:00', NULL, NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('123e4567-e89b-12d3-a456-426614174002', 'Shoey', 30, 0.1337, '/images/mixtape-shoey.png', '2023-09-19 00:00:00', NULL, NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('123e4567-e89b-12d3-a456-426614174003', 'SOL', 30, 0.142069, '/images/mixtape-sol-1024.png', '2023-09-06 00:00:00', NULL, NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "Mint" ADD COLUMN "templateId" TEXT;

-- Update existing rows
UPDATE "Mint"
SET "templateId" = (
  SELECT "id" FROM "NftTemplate" WHERE "name" = ("Mint"."template"->>'name')
);

-- AlterTable
ALTER TABLE "Mint" ALTER COLUMN "templateId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Mint" ADD CONSTRAINT "Mint_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "NftTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop template column
ALTER TABLE "Mint" DROP COLUMN "template";
