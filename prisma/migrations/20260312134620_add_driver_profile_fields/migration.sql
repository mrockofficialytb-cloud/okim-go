-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addressCity" TEXT,
ADD COLUMN     "addressStreet" TEXT,
ADD COLUMN     "addressZip" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "driverLicenseExpiry" TIMESTAMP(3),
ADD COLUMN     "driverLicenseNumber" TEXT,
ADD COLUMN     "idDocumentNumber" TEXT;
