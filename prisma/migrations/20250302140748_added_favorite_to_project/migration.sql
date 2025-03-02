/*
  Warnings:

  - You are about to drop the `UserFavoriteProject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserFavoriteProject" DROP CONSTRAINT "UserFavoriteProject_ProjectId_fkey";

-- DropForeignKey
ALTER TABLE "UserFavoriteProject" DROP CONSTRAINT "UserFavoriteProject_UserId_fkey";

-- DropTable
DROP TABLE "UserFavoriteProject";

-- CreateTable
CREATE TABLE "UserFavouriteProject" (
    "UserId" TEXT NOT NULL,
    "ProjectId" TEXT NOT NULL,

    CONSTRAINT "UserFavouriteProject_pkey" PRIMARY KEY ("UserId","ProjectId")
);

-- AddForeignKey
ALTER TABLE "UserFavouriteProject" ADD CONSTRAINT "UserFavouriteProject_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES "Project"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavouriteProject" ADD CONSTRAINT "UserFavouriteProject_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
