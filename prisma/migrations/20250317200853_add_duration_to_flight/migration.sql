/*
  Warnings:

  - Added the required column `duration` to the `flights` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flights" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "stops" INTEGER NOT NULL DEFAULT 0;
