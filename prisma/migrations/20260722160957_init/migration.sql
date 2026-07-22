-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'warga',
    "noHp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Letter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenisSurat" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "keperluan" TEXT NOT NULL,
    "keterangan" TEXT,
    "dokumenUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Letter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Information" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "ringkasan" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gambarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VillageSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "namaDesa" TEXT NOT NULL DEFAULT 'Desa Sejahtera',
    "kepalaDesa" TEXT NOT NULL DEFAULT 'Bapak H. Suharto',
    "alamat" TEXT NOT NULL DEFAULT 'Jl. Utama No. 1, Desa Sejahtera',
    "telepon" TEXT NOT NULL DEFAULT '(021) 1234-5678',
    "email" TEXT NOT NULL DEFAULT 'info@desasejahtera.go.id',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nik_key" ON "User"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
