-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "pickupCustomerSignature" TEXT,
ADD COLUMN     "pickupCustomerSignedAt" TIMESTAMP(3),
ADD COLUMN     "pickupOwnerSignature" TEXT,
ADD COLUMN     "pickupOwnerSignedAt" TIMESTAMP(3);
