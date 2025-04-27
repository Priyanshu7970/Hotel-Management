/*
  Warnings:

  - You are about to alter the column `rent` on the `Home` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Home" ALTER COLUMN "rent" SET DATA TYPE INTEGER;
