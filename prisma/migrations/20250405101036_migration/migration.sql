/*
  Warnings:

  - You are about to drop the column `amenities` on the `Home` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Home` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Home" DROP COLUMN "amenities",
ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "propertyType" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "requirements" SET DEFAULT ARRAY[]::TEXT[];
