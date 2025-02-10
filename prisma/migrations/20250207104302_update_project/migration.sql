/*
  Warnings:

  - Changed the type of `LeadUserId` on the `Project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "LeadUserId",
ADD COLUMN     "LeadUserId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_LeadUserId_fkey" FOREIGN KEY ("LeadUserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
