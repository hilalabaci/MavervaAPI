/*
  Warnings:

  - You are about to drop the column `boardId` on the `UserProject` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserProject" DROP CONSTRAINT "UserProject_boardId_fkey";

-- AlterTable
ALTER TABLE "UserProject" DROP COLUMN "boardId";
