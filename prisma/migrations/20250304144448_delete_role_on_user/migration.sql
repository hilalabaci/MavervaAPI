/*
  Warnings:

  - You are about to drop the column `Role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `SprintId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_SprintId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Role",
DROP COLUMN "SprintId";
