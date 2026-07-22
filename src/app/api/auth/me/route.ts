import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        nama: true,
        nik: true,
        alamat: true,
        username: true,
        role: true,
        noHp: true,
        createdAt: true,
      },
    });

    if (!user) {
      return Response.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return Response.json({ user });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
