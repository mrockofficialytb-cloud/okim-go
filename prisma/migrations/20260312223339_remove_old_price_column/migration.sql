/*
  Warnings:

  - You are about to drop the column `pricePerDay` on the `CarVariant` table. All the data in the column will be lost.
  - Made the column `pricePerDayLong` on table `CarVariant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pricePerDayShort` on table `CarVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CarVariant" DROP COLUMN "pricePerDay",
ALTER COLUMN "pricePerDayLong" SET NOT NULL,
ALTER COLUMN "pricePerDayShort" SET NOT NULL;
