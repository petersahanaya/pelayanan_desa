import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { nama, nik, alamat, username, password } = await request.json();

    if (!nama || !nik || !alamat || !username || !password) {
      return Response.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return Response.json(
        { error: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    // Check if NIK already exists
    const existingNik = await prisma.user.findUnique({
      where: { nik },
    });

    if (existingNik) {
      return Response.json(
        { error: "NIK sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nama,
        nik,
        alamat,
        username,
        password: hashedPassword,
        role: "warga",
      },
    });

    const token = await createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return Response.json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
        nik: user.nik,
        alamat: user.alamat,
      },
    });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
