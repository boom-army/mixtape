-- DropForeignKey
ALTER TABLE "Points" DROP CONSTRAINT "Points_userId_fkey";

-- AlterTable
ALTER TABLE "Points" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Points" ADD CONSTRAINT "Points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
