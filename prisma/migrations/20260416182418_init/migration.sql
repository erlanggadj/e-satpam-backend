-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SATPAM', 'ADMIN', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "MutasiStatus" AS ENUM ('ACTIVE', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "Attendance" AS ENUM ('HADIR', 'SAKIT', 'IZIN');

-- CreateEnum
CREATE TYPE "KejadianStatus" AS ENUM ('SUBMITTED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "KeyStatus" AS ENUM ('DEPOSITED', 'TAKEN');

-- CreateEnum
CREATE TYPE "ContainerStatus" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "AfkirStatus" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "IzinStatus" AS ENUM ('OUT', 'RETURNED');

-- CreateEnum
CREATE TYPE "ReasonType" AS ENUM ('KERJA', 'PRIBADI');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SATPAM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mutasi" (
    "id" TEXT NOT NULL,
    "posName" TEXT NOT NULL,
    "shiftName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "status" "MutasiStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mutasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutasiMember" (
    "id" TEXT NOT NULL,
    "mutasiId" TEXT NOT NULL,
    "guardName" TEXT NOT NULL,
    "jabatan" TEXT,
    "attendance" "Attendance" NOT NULL,

    CONSTRAINT "MutasiMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutasiActivity" (
    "id" TEXT NOT NULL,
    "mutasiId" TEXT NOT NULL,
    "guardName" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MutasiActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaporanKejadian" (
    "id" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "tempat" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "pukul" TEXT NOT NULL,
    "korbanNama" TEXT,
    "korbanAlamat" TEXT,
    "pelakuNama" TEXT,
    "pelakuAlamat" TEXT,
    "saksi1" TEXT,
    "saksi2" TEXT,
    "saksi3" TEXT,
    "saksi4" TEXT,
    "bukti1" TEXT,
    "bukti2" TEXT,
    "bukti3" TEXT,
    "bukti4" TEXT,
    "kronologis" TEXT,
    "kerugian" TEXT,
    "tindakan" TEXT,
    "status" "KejadianStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaporanKejadian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaporanPiket" (
    "id" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "petugas" TEXT NOT NULL,
    "hasil" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaporanPiket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BukuTamu" (
    "id" TEXT NOT NULL,
    "namaTamu" TEXT NOT NULL,
    "tujuan" TEXT,
    "pukul" TEXT NOT NULL,
    "keterangan" TEXT,
    "noTelp" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BukuTamu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyLog" (
    "id" TEXT NOT NULL,
    "keyName" TEXT NOT NULL,
    "depositorName" TEXT NOT NULL,
    "depositorDivision" TEXT,
    "depositTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "KeyStatus" NOT NULL DEFAULT 'DEPOSITED',
    "takerName" TEXT,
    "takerDivision" TEXT,
    "keterangan" TEXT,
    "takeTime" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerLog" (
    "id" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "total" TEXT NOT NULL,
    "containerIn" TEXT NOT NULL,
    "identityNote" TEXT,
    "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ContainerStatus" NOT NULL DEFAULT 'IN',
    "containerOut" TEXT,
    "checkOutTime" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContainerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AfkirLog" (
    "id" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "total" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "identityNote" TEXT,
    "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AfkirStatus" NOT NULL DEFAULT 'IN',
    "checkOutTime" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AfkirLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IzinStaff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "reasonType" "ReasonType" NOT NULL,
    "destination" TEXT NOT NULL,
    "note" TEXT,
    "timeOut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeIn" TIMESTAMP(3),
    "status" "IzinStatus" NOT NULL DEFAULT 'OUT',
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IzinStaff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LaporanKejadian_nomor_key" ON "LaporanKejadian"("nomor");

-- AddForeignKey
ALTER TABLE "MutasiMember" ADD CONSTRAINT "MutasiMember_mutasiId_fkey" FOREIGN KEY ("mutasiId") REFERENCES "Mutasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutasiActivity" ADD CONSTRAINT "MutasiActivity_mutasiId_fkey" FOREIGN KEY ("mutasiId") REFERENCES "Mutasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
