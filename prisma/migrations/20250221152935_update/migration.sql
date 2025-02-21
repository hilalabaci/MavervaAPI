-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');

-- AlterTable
ALTER TABLE "UserBoard" ADD COLUMN     "Role" "UserRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "UserProject" ADD COLUMN     "Role" "UserRole" NOT NULL DEFAULT 'MEMBER';
