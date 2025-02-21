/*
  Warnings:

  - The values [ADMIN,MEMBER,VIEWER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sprintId` on the `User` table. All the data in the column will be lost.
  - Added the required column `Message` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('Admin', 'Member', 'Viewer');
ALTER TABLE "UserBoard" ALTER COLUMN "Role" DROP DEFAULT;
ALTER TABLE "UserProject" ALTER COLUMN "Role" DROP DEFAULT;
ALTER TABLE "UserProject" ALTER COLUMN "Role" TYPE "UserRole_new" USING ("Role"::text::"UserRole_new");
ALTER TABLE "UserBoard" ALTER COLUMN "Role" TYPE "UserRole_new" USING ("Role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "UserBoard" ALTER COLUMN "Role" SET DEFAULT 'Viewer';
ALTER TABLE "UserProject" ALTER COLUMN "Role" SET DEFAULT 'Viewer';
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_sprintId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "isRead",
DROP COLUMN "message",
DROP COLUMN "userId",
ADD COLUMN     "IsRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Message" VARCHAR(128) NOT NULL,
ADD COLUMN     "UserId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePicture",
DROP COLUMN "sprintId",
ADD COLUMN     "ProfilePicture" TEXT,
ADD COLUMN     "Role" TEXT NOT NULL DEFAULT 'member',
ADD COLUMN     "SprintId" TEXT;

-- AlterTable
ALTER TABLE "UserBoard" ALTER COLUMN "Role" SET DEFAULT 'Viewer';

-- AlterTable
ALTER TABLE "UserProject" ALTER COLUMN "Role" SET DEFAULT 'Viewer';

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_SprintId_fkey" FOREIGN KEY ("SprintId") REFERENCES "Sprint"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
