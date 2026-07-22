import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ users });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
