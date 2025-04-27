/*
  Warnings:

  - You are about to drop the column `imageUrls` on the `Home` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Home" DROP COLUMN "imageUrls",
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
