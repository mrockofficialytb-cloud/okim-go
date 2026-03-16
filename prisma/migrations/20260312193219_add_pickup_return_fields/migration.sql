-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "pickupAt" TIMESTAMP(3),
ADD COLUMN     "pickupFuel" TEXT,
ADD COLUMN     "pickupMileage" INTEGER,
ADD COLUMN     "pickupNote" TEXT,
ADD COLUMN     "returnAt" TIMESTAMP(3),
ADD COLUMN     "returnFuel" TEXT,
ADD COLUMN     "returnMileage" INTEGER,
ADD COLUMN     "returnNote" TEXT;
