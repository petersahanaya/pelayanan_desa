import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return Response.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return Response.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

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
