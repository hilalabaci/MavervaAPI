/*
  Warnings:

  - You are about to drop the `UserIssue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserIssue" DROP CONSTRAINT "UserIssue_IssueId_fkey";

-- DropForeignKey
ALTER TABLE "UserIssue" DROP CONSTRAINT "UserIssue_UserId_fkey";

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "AssigneeUserId" TEXT,
ADD COLUMN     "ReporterUserId" TEXT;

-- DropTable
DROP TABLE "UserIssue";

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_ReporterUserId_fkey" FOREIGN KEY ("ReporterUserId") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_AssigneeUserId_fkey" FOREIGN KEY ("AssigneeUserId") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
