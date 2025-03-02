/*
  Warnings:

  - You are about to drop the column `IsFavorite` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "IsFavorite";

-- CreateTable
CREATE TABLE "UserFavoriteProject" (
    "UserId" TEXT NOT NULL,
    "ProjectId" TEXT NOT NULL,

    CONSTRAINT "UserFavoriteProject_pkey" PRIMARY KEY ("UserId","ProjectId")
);

-- AddForeignKey
ALTER TABLE "UserFavoriteProject" ADD CONSTRAINT "UserFavoriteProject_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES "Project"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteProject" ADD CONSTRAINT "UserFavoriteProject_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
