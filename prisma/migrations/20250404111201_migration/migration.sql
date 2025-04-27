/*
  Warnings:

  - The `requirements` column on the `Home` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Home" DROP COLUMN "requirements",
ADD COLUMN     "requirements" TEXT[];
