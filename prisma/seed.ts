import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const wargaPassword = await bcrypt.hash("warga123", 10);

  // Create admin
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      nama: "Administrator",
      nik: "3201000000000001",
      alamat: "Kantor Desa Sejahtera",
      username: "admin",
      password: adminPassword,
      role: "admin",
    },
  });

  // Create warga
  await prisma.user.upsert({
    where: { username: "budi" },
    update: {},
    create: {
      nama: "Budi Santoso",
      nik: "3201000000000002",
      alamat: "Jl. Merdeka No. 10, RT 01/RW 02",
      username: "budi",
      password: wargaPassword,
      role: "warga",
      noHp: "081234567890",
    },
  });

  await prisma.user.upsert({
    where: { username: "siti" },
    update: {},
    create: {
      nama: "Siti Rahayu",
      nik: "3201000000000003",
      alamat: "Jl. Pahlawan No. 25, RT 03/RW 04",
      username: "siti",
      password: wargaPassword,
      role: "warga",
      noHp: "085678901234",
    },
  });

  // Create village settings
  await prisma.villageSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      namaDesa: "Desa Sejahtera",
      kepalaDesa: "Bapak H. Suharto",
      alamat: "Jl. Utama No. 1, Desa Sejahtera",
      telepon: "(021) 1234-5678",
      email: "info@desasejahtera.go.id",
    },
  });

  // Create sample information
  await prisma.information.createMany({
    data: [
      {
        judul: "Pembangunan Jalan Desa Tahap II",
        kategori: "Berita",
        ringkasan:
          "Pembangunan jalan desa tahap II telah dimulai dan diperkirakan selesai dalam 3 bulan.",
        konten:
          "Pemerintah Desa Sejahtera menginformasikan bahwa pembangunan jalan desa tahap II telah resmi dimulai pada Senin, 15 Juli 2026. Proyek ini mencakup pengaspalan jalan sepanjang 2 km dari simpang tiga hingga balai desa. Diperkirakan proyek akan selesai dalam 3 bulan ke depan. Masyarakat dihimbau untuk menjaga ketertiban lalu lintas selama proses pembangunan berlangsung.",
        tanggal: new Date(),
      },
      {
        judul: "Pengumuman Jadwal Posyandu Bulan Agustus",
        kategori: "Pengumuman",
        ringkasan:
          "Jadwal posyandu untuk bulan Agustus telah ditentukan.",
        konten:
          "Bagi ibu-ibu yang memiliki bayi dan anak balita, diinformasikan bahwa jadwal posyandu bulan Agustus akan dilaksanakan pada:\n\n- Rabu, 6 Agustus 2026: RW 01\n- Rabu, 13 Agustus 2026: RW 02\n- Rabu, 20 Agustus 2026: RW 03\n- Rabu, 27 Agustus 2026: RW 04\n\nJam operasional: 08.00 - 11.00 WIB\nLokasi: Balai RW masing-masing",
        tanggal: new Date(Date.now() - 86400000),
      },
      {
        judul: "Pelatihan UMKM Digital Marketing",
        kategori: "Berita",
        ringkasan:
          "Pemdes mengadakan pelatihan digital marketing untuk pelaku UMKM.",
        konten:
          "Pemerintah Desa Sejahtera bekerja sama dengan Dinas Koperasi dan UMKM Kabupaten akan mengadakan pelatihan Digital Marketing Gratis untuk pelaku UMKM di desa. Pelatihan akan dilaksanakan pada:\n\nTanggal: Sabtu, 23 Agustus 2026\nWaktu: 09.00 - 16.00 WIB\nLokasi: Aula Kantor Desa\nKuota: 30 orang\n\nPendaftaran dapat dilakukan di kantor desa atau menghubungi nomor 0812-3456-7890.",
        tanggal: new Date(Date.now() - 172800000),
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
