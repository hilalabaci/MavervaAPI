/*
  Warnings:

  - You are about to drop the column `UserId` on the `Board` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_UserId_fkey";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN "UserId";

-- AlterTable
ALTER TABLE "UserProject" ADD COLUMN     "boardId" TEXT;

-- CreateTable
CREATE TABLE "UserBoard" (
    "UserId" TEXT NOT NULL,
    "BoardId" TEXT NOT NULL,
    "ProjectId" TEXT NOT NULL,

    CONSTRAINT "UserBoard_pkey" PRIMARY KEY ("UserId","BoardId")
);

-- CreateTable
CREATE TABLE "_BoardToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BoardToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BoardToUser_B_index" ON "_BoardToUser"("B");

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBoard" ADD CONSTRAINT "UserBoard_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES "Project"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBoard" ADD CONSTRAINT "UserBoard_BoardId_fkey" FOREIGN KEY ("BoardId") REFERENCES "Board"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBoard" ADD CONSTRAINT "UserBoard_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoardToUser" ADD CONSTRAINT "_BoardToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Board"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoardToUser" ADD CONSTRAINT "_BoardToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
