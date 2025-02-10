/*
  Warnings:

  - The primary key for the `Backlog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Board` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Column` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Issue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Label` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Sprint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserIssue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserProject` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Backlog" DROP CONSTRAINT "Backlog_BoardId_fkey";

-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_ProjectId_fkey";

-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_userId_fkey";

-- DropForeignKey
ALTER TABLE "Column" DROP CONSTRAINT "Column_BoardId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_BacklogId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_BoardId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_ColumnId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_LabelId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_ProjectId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_SprintId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_UserId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_FromUserId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_ToUserId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_LeadUserId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_UserId_fkey";

-- DropForeignKey
ALTER TABLE "Sprint" DROP CONSTRAINT "Sprint_BoardId_fkey";

-- DropForeignKey
ALTER TABLE "UserIssue" DROP CONSTRAINT "UserIssue_IssueId_fkey";

-- DropForeignKey
ALTER TABLE "UserIssue" DROP CONSTRAINT "UserIssue_UserId_fkey";

-- DropForeignKey
ALTER TABLE "UserProject" DROP CONSTRAINT "UserProject_ProjectId_fkey";

-- DropForeignKey
ALTER TABLE "UserProject" DROP CONSTRAINT "UserProject_UserId_fkey";

-- DropIndex
DROP INDEX "Board_Id_key";

-- AlterTable
ALTER TABLE "Backlog" DROP CONSTRAINT "Backlog_pkey",
ALTER COLUMN "Id" DROP DEFAULT,
ALTER COLUMN "Id" SET DATA TYPE TEXT,
ALTER COLUMN "BoardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Backlog_pkey" PRIMARY KEY ("Id");
DROP SEQUENCE "Backlog_Id_seq";

-- AlterTable
ALTER TABLE "Board" DROP CONSTRAINT "Board_pkey",
ALTER COLUMN "Id" DROP DEFAULT,
ALTER COLUMN "Id" SET DATA TYPE TEXT,
ALTER COLUMN "ProjectId" SET DATA TYPE TEXT,
ALTER COLUMN "LeadUserId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Board_pkey" PRIMARY KEY ("Id");
DROP SEQUENCE "Board_Id_seq";

-- AlterTable
ALTER TABLE "Column" DROP CONSTRAINT "Column_pkey",
ALTER COLUMN "Id" DROP DEFAULT,
ALTER COLUMN "Id" SET DATA TYPE TEXT,
ALTER COLUMN "BoardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Column_pkey" PRIMARY KEY ("Id");
DROP SEQUENCE "Column_Id_seq";

-- AlterTable
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_pkey",
ALTER COLUMN "Id" DROP DEFAULT,
ALTER COLUMN "Id" SET DATA TYPE TEXT,
ALTER COLUMN "ProjectId" SET DATA TYPE TEXT,
ALTER COLUMN "UserId" SET DATA TYPE TEXT,
ALTER COLUMN "LabelId" SET DATA TYPE TEXT,
ALTER COLUMN "BoardId" SET DATA TYPE TEXT,
ALTER COLUMN "ColumnId" SET DATA TYPE TEXT,
ALTER COLUMN "BacklogId" SET DATA TYPE TEXT,
ALTER COLUMN "SprintId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Issue_pkey" PRIMARY KEY ("Id");
DROP SEQUENCE "Issue_Id_seq";

-- AlterTable
ALTER TABLE "Label" DROP CONSTRAINT "Label_pkey",
ALTER COLUMN "Id" DROP DEFAULT,
ALTER COLUMN "Id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Label_pkey" PRIMARY KEY ("Id");
DROP SEQUENCE "Label_Id_seq";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "FromUserId" SET DATA TYPE TEXT,
ALTER COLUMN "ToUserId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
ALTER COLUMN "Id" DROP DEFAULT,
ALTER COLUMN "Id" SET DATA TYPE TEXT,
ALTER COLUMN "UserId" SET DATA TYPE TEXT,
ALTER COLUMN "LeadUserId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("Id");
DROP SEQUENCE "Project_Id_seq";

-- AlterTable
ALTER TABLE "Sprint" DROP CONSTRAINT "Sprint_pkey",
ALTER COLUMN "Id" DROP DEFAULT,
ALTER COLUMN "Id" SET DATA TYPE TEXT,
ALTER COLUMN "BoardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sprint_pkey" PRIMARY KEY ("Id");
DROP SEQUENCE "Sprint_Id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "Id" DROP DEFAULT,
ALTER COLUMN "Id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("Id");
DROP SEQUENCE "User_Id_seq";

-- AlterTable
ALTER TABLE "UserIssue" DROP CONSTRAINT "UserIssue_pkey",
ALTER COLUMN "UserId" SET DATA TYPE TEXT,
ALTER COLUMN "IssueId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserIssue_pkey" PRIMARY KEY ("UserId", "IssueId");

-- AlterTable
ALTER TABLE "UserProject" DROP CONSTRAINT "UserProject_pkey",
ALTER COLUMN "UserId" SET DATA TYPE TEXT,
ALTER COLUMN "ProjectId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserProject_pkey" PRIMARY KEY ("UserId", "ProjectId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_LeadUserId_fkey" FOREIGN KEY ("LeadUserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES "Project"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_BoardId_fkey" FOREIGN KEY ("BoardId") REFERENCES "Board"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_BoardId_fkey" FOREIGN KEY ("BoardId") REFERENCES "Board"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_BoardId_fkey" FOREIGN KEY ("BoardId") REFERENCES "Board"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_BacklogId_fkey" FOREIGN KEY ("BacklogId") REFERENCES "Backlog"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_BoardId_fkey" FOREIGN KEY ("BoardId") REFERENCES "Board"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_ColumnId_fkey" FOREIGN KEY ("ColumnId") REFERENCES "Column"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_LabelId_fkey" FOREIGN KEY ("LabelId") REFERENCES "Label"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES "Project"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_SprintId_fkey" FOREIGN KEY ("SprintId") REFERENCES "Sprint"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES "Project"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIssue" ADD CONSTRAINT "UserIssue_IssueId_fkey" FOREIGN KEY ("IssueId") REFERENCES "Issue"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIssue" ADD CONSTRAINT "UserIssue_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_FromUserId_fkey" FOREIGN KEY ("FromUserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_ToUserId_fkey" FOREIGN KEY ("ToUserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
