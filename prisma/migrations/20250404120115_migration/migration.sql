/*
  Warnings:

  - Added the required column `number` to the `Home` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Home" ADD COLUMN     "number" TEXT NOT NULL;
