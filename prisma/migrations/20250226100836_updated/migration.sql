-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_ColumnId_fkey";

-- AlterTable
ALTER TABLE "Issue" ALTER COLUMN "ColumnId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_ColumnId_fkey" FOREIGN KEY ("ColumnId") REFERENCES "Column"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
