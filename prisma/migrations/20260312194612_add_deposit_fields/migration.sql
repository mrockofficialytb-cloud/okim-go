-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('UNPAID', 'PAID', 'RETURNED');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "depositAmount" INTEGER,
ADD COLUMN     "depositStatus" "DepositStatus";
