/*
  Warnings:

  - The values [VerifyEmail] on the enum `EmailTemplateEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmailTemplateEnum_new" AS ENUM ('Welcome', 'SendOtp', 'SetPassword');
ALTER TABLE "EmailTemplate" ALTER COLUMN "Type" TYPE "EmailTemplateEnum_new" USING ("Type"::text::"EmailTemplateEnum_new");
ALTER TYPE "EmailTemplateEnum" RENAME TO "EmailTemplateEnum_old";
ALTER TYPE "EmailTemplateEnum_new" RENAME TO "EmailTemplateEnum";
DROP TYPE "EmailTemplateEnum_old";
COMMIT;
