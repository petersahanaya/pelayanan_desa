import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3001;
const JWT_SECRET = "pelayanan-desa-secret-key-2026";

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ============ PRISMA CLIENT ============
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ============ AUTH HELPERS ============
function generateToken(user: { id: string; username: string; role: string }) {
  return jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const cookieHeader = req.headers.cookie;
  let token = "";

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (cookieHeader) {
    const match = cookieHeader.match(/session=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function adminMiddleware(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

// ============ AUTH ROUTES ============
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password harus diisi" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Username atau password salah" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Username atau password salah" });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, nama: user.nama, username: user.username, role: user.role, nik: user.nik, alamat: user.alamat },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { nama, nik, alamat, username, password } = req.body;
    if (!nama || !nik || !alamat || !username || !password) {
      return res.status(400).json({ error: "Semua field harus diisi" });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: "Username sudah digunakan" });

    const existingNik = await prisma.user.findUnique({ where: { nik } });
    if (existingNik) return res.status(400).json({ error: "NIK sudah terdaftar" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { nama, nik, alamat, username, password: hashed, role: "warga" },
    });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, nama: user.nama, username: user.username, role: user.role, nik: user.nik, alamat: user.alamat },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.get("/api/auth/me", authMiddleware, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, nama: true, nik: true, alamat: true, username: true, role: true, noHp: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.json({ message: "Berhasil logout" });
});

// ============ COMPLAINTS ============
app.get("/api/complaints", authMiddleware, async (req: any, res: any) => {
  try {
    const where = req.user.role === "admin" ? {} : { userId: req.user.userId };
    const complaints = await prisma.complaint.findMany({
      where,
      include: { user: { select: { id: true, nama: true, nik: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.post("/api/complaints", authMiddleware, async (req: any, res: any) => {
  try {
    const { judul, kategori, lokasi, deskripsi, fotoUrl } = req.body;
    if (!judul || !kategori || !lokasi || !deskripsi) {
      return res.status(400).json({ error: "Semua field harus diisi" });
    }
    const complaint = await prisma.complaint.create({
      data: { judul, kategori, lokasi, deskripsi, fotoUrl, userId: req.user.userId },
    });
    res.json({ complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.get("/api/complaints/:id", authMiddleware, async (req: any, res: any) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, nama: true, nik: true } } },
    });
    if (!complaint) return res.status(404).json({ error: "Pengaduan tidak ditemukan" });
    res.json({ complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.patch("/api/complaints/:id", authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    const { status } = req.body;
    if (!status || !["Menunggu", "Diproses", "Selesai", "Ditolak"].includes(status)) {
      return res.status(400).json({ error: "Status tidak valid" });
    }
    const complaint = await prisma.complaint.update({ where: { id: req.params.id }, data: { status } });
    res.json({ complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// ============ LETTERS ============
app.get("/api/letters", authMiddleware, async (req: any, res: any) => {
  try {
    const where = req.user.role === "admin" ? {} : { userId: req.user.userId };
    const letters = await prisma.letter.findMany({
      where,
      include: { user: { select: { id: true, nama: true, nik: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ letters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.post("/api/letters", authMiddleware, async (req: any, res: any) => {
  try {
    const { jenisSurat, nik, namaLengkap, noHp, alamat, keperluan, keterangan, dokumenUrl } = req.body;
    if (!jenisSurat || !nik || !namaLengkap || !noHp || !alamat || !keperluan) {
      return res.status(400).json({ error: "Semua field wajib harus diisi" });
    }
    const letter = await prisma.letter.create({
      data: { jenisSurat, nik, namaLengkap, noHp, alamat, keperluan, keterangan, dokumenUrl, userId: req.user.userId },
    });
    res.json({ letter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.get("/api/letters/:id", authMiddleware, async (req: any, res: any) => {
  try {
    const letter = await prisma.letter.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, nama: true, nik: true } } },
    });
    if (!letter) return res.status(404).json({ error: "Surat tidak ditemukan" });
    res.json({ letter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.patch("/api/letters/:id", authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    const { status } = req.body;
    if (!status || !["Menunggu", "Diproses", "Selesai", "Ditolak"].includes(status)) {
      return res.status(400).json({ error: "Status tidak valid" });
    }
    const letter = await prisma.letter.update({ where: { id: req.params.id }, data: { status } });
    res.json({ letter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// ============ INFORMATION ============
app.get("/api/information", async (req, res) => {
  try {
    const kategori = req.query.kategori as string;
    const limit = req.query.limit as string;
    const where = kategori && kategori !== "Semua" ? { kategori } : {};
    const informations = await prisma.information.findMany({
      where,
      orderBy: { tanggal: "desc" },
      ...(limit ? { take: parseInt(limit) } : {}),
    });
    res.json({ informations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.post("/api/information", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { judul, kategori, ringkasan, konten, tanggal, gambarUrl } = req.body;
    if (!judul || !kategori || !ringkasan || !konten) {
      return res.status(400).json({ error: "Semua field harus diisi" });
    }
    const information = await prisma.information.create({
      data: { judul, kategori, ringkasan, konten, tanggal: tanggal ? new Date(tanggal) : new Date(), gambarUrl },
    });
    res.json({ information });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.get("/api/information/:id", async (req, res) => {
  try {
    const information = await prisma.information.findUnique({ where: { id: req.params.id } });
    if (!information) return res.status(404).json({ error: "Informasi tidak ditemukan" });
    res.json({ information });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.put("/api/information/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { judul, kategori, ringkasan, konten, tanggal, gambarUrl } = req.body;
    const information = await prisma.information.update({
      where: { id: req.params.id },
      data: { judul, kategori, ringkasan, konten, tanggal: tanggal ? new Date(tanggal) : undefined, gambarUrl },
    });
    res.json({ information });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.delete("/api/information/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.information.delete({ where: { id: req.params.id } });
    res.json({ message: "Informasi berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// ============ USERS ============
app.get("/api/users", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, nama: true, nik: true, alamat: true, username: true, role: true, noHp: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.patch("/api/users/profile", authMiddleware, async (req: any, res: any) => {
  try {
    const { nama, alamat, oldPassword, newPassword } = req.body;

    if (nama !== undefined || alamat !== undefined) {
      const updateData: any = {};
      if (nama) updateData.nama = nama;
      if (alamat) updateData.alamat = alamat;
      await prisma.user.update({ where: { id: req.user.userId }, data: updateData });
    }

    if (oldPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) return res.status(400).json({ error: "Password lama salah" });
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: req.user.userId }, data: { password: hashed } });
    }

    res.json({ message: "Profil berhasil diperbarui" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// ============ STATS ============
app.get("/api/stats", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const [informationCount, complaintsCount, lettersCount, usersCount] = await Promise.all([
      prisma.information.count(),
      prisma.complaint.count(),
      prisma.letter.count(),
      prisma.user.count({ where: { role: "warga" } }),
    ]);

    const complaintsByStatus = await prisma.complaint.groupBy({ by: ["status"], _count: { status: true } });
    const lettersByStatus = await prisma.letter.groupBy({ by: ["status"], _count: { status: true } });

    res.json({
      statistics: { information: informationCount, complaints: complaintsCount, letters: lettersCount, users: usersCount },
      complaintsByStatus: complaintsByStatus.map((i) => ({ status: i.status, count: i._count.status })),
      lettersByStatus: lettersByStatus.map((i) => ({ status: i.status, count: i._count.status })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// ============ VILLAGE SETTINGS ============
app.get("/api/village-settings", async (_req, res) => {
  try {
    const settings = await prisma.villageSetting.findUnique({ where: { id: "singleton" } });
    res.json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.put("/api/village-settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { namaDesa, kepalaDesa, alamat, telepon, email } = req.body;
    const settings = await prisma.villageSetting.upsert({
      where: { id: "singleton" },
      update: { namaDesa, kepalaDesa, alamat, telepon, email },
      create: { id: "singleton", namaDesa, kepalaDesa, alamat, telepon, email },
    });
    res.json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// ============ START SERVER ============
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`For Android emulator, use: http://10.0.2.2:${PORT}`);
});
