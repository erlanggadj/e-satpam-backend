-- CreateEnum
CREATE TYPE "PiketStatus" AS ENUM ('SUBMITTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "TamuStatus" AS ENUM ('SUBMITTED', 'APPROVED');

-- AlterEnum
ALTER TYPE "AfkirStatus" ADD VALUE 'APPROVED';

-- AlterEnum
ALTER TYPE "ContainerStatus" ADD VALUE 'APPROVED';

-- AlterEnum
ALTER TYPE "IzinStatus" ADD VALUE 'APPROVED';

-- AlterEnum
ALTER TYPE "KejadianStatus" ADD VALUE 'APPROVED';

-- AlterEnum
ALTER TYPE "KeyStatus" ADD VALUE 'APPROVED';

-- AlterEnum
ALTER TYPE "MutasiStatus" ADD VALUE 'APPROVED';

-- AlterTable
ALTER TABLE "BukuTamu" ADD COLUMN     "status" "TamuStatus" NOT NULL DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "LaporanPiket" ADD COLUMN     "status" "PiketStatus" NOT NULL DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "jabatan" TEXT;
