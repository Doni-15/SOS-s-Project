-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'SERVED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "served_at" TIMESTAMP(3);
