-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sprintId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
