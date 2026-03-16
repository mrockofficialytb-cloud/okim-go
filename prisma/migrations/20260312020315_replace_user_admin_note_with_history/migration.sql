/*
  Warnings:

  - You are about to drop the column `adminNote` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "adminNote";

-- CreateTable
CREATE TABLE "UserAdminNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAdminNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAdminNote_userId_createdAt_idx" ON "UserAdminNote"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserAdminNote" ADD CONSTRAINT "UserAdminNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
