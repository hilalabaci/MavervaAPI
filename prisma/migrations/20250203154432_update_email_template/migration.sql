-- CreateEnum
CREATE TYPE "EmailTemplateEnum" AS ENUM ('Welcome', 'VerifyEmail');

-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "Notification" (
    "Id" TEXT NOT NULL,
    "FromUserId" INTEGER NOT NULL,
    "ToUserId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" VARCHAR(128) NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "Id" TEXT NOT NULL,
    "From" TEXT NOT NULL,
    "Subject" TEXT NOT NULL,
    "HtmlBody" TEXT NOT NULL,
    "Type" "EmailTemplateEnum" NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_FromUserId_fkey" FOREIGN KEY ("FromUserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_ToUserId_fkey" FOREIGN KEY ("ToUserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
