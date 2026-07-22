import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const complaints = await prisma.complaint.findMany({
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

    return Response.json({ complaints });
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

    const { judul, kategori, lokasi, deskripsi, fotoUrl } =
      await request.json();

    if (!judul || !kategori || !lokasi || !deskripsi) {
      return Response.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        judul,
        kategori,
        lokasi,
        deskripsi,
        fotoUrl,
        userId: session.userId,
      },
    });

    return Response.json({ complaint }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
