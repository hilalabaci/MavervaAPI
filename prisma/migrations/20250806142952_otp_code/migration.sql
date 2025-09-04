-- CreateTable
CREATE TABLE "OtpCode" (
    "Id" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,
    "Used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("Id")
);
