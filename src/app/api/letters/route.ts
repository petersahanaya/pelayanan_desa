import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const letters = await prisma.letter.findMany({
      where: session.role === "admin" ? {} : { userId: session.userId },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            nik: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ letters });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jenisSurat, nik, namaLengkap, noHp, alamat, keperluan, keterangan, dokumenUrl } =
      await request.json();

    if (!jenisSurat || !nik || !namaLengkap || !noHp || !alamat || !keperluan) {
      return Response.json(
        { error: "Semua field wajib harus diisi" },
        { status: 400 }
      );
    }

    const letter = await prisma.letter.create({
      data: {
        jenisSurat,
        nik,
        namaLengkap,
        noHp,
        alamat,
        keperluan,
        keterangan,
        dokumenUrl,
        userId: session.userId,
      },
    });

    return Response.json({ letter }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
