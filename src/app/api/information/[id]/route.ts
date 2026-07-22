import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const information = await prisma.information.findUnique({
      where: { id },
    });

    if (!information) {
      return Response.json(
        { error: "Informasi tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ information });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { judul, kategori, ringkasan, konten, tanggal, gambarUrl } =
      await request.json();

    const information = await prisma.information.update({
      where: { id },
      data: {
        judul,
        kategori,
        ringkasan,
        konten,
        tanggal: tanggal ? new Date(tanggal) : undefined,
        gambarUrl,
      },
    });

    return Response.json({ information });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.information.delete({
      where: { id },
    });

    return Response.json({ message: "Informasi berhasil dihapus" });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
