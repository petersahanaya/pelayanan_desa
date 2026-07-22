import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const kategori = url.searchParams.get("kategori");
    const limit = url.searchParams.get("limit");

    const where = kategori && kategori !== "Semua" ? { kategori } : {};

    const informations = await prisma.information.findMany({
      where,
      orderBy: { tanggal: "desc" },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return Response.json({ informations });
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
    if (!session || session.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { judul, kategori, ringkasan, konten, tanggal, gambarUrl } =
      await request.json();

    if (!judul || !kategori || !ringkasan || !konten) {
      return Response.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const information = await prisma.information.create({
      data: {
        judul,
        kategori,
        ringkasan,
        konten,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        gambarUrl,
      },
    });

    return Response.json({ information }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
