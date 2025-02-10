/*
  Warnings:

  - You are about to drop the column `description` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Key]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Key` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Name` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropIndex
DROP INDEX "Project_key_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "description",
DROP COLUMN "key",
DROP COLUMN "name",
DROP COLUMN "userId",
ADD COLUMN     "Description" TEXT,
ADD COLUMN     "Key" TEXT NOT NULL,
ADD COLUMN     "Name" TEXT NOT NULL,
ADD COLUMN     "UserId" INTEGER NOT NULL,
ALTER COLUMN "LeadUserId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_Key_key" ON "Project"("Key");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
