/*
  Warnings:

  - The `Status` column on the `Issue` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "Status",
ADD COLUMN     "Status" INTEGER NOT NULL DEFAULT 1;
