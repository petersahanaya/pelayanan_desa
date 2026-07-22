import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const letter = await prisma.letter.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            nik: true,
          },
        },
      },
    });

    if (!letter) {
      return Response.json(
        { error: "Surat tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ letter });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !["Menunggu", "Diproses", "Selesai", "Ditolak"].includes(status)) {
      return Response.json({ error: "Status tidak valid" }, { status: 400 });
    }

    // Only admin can update status
    if (session.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const letter = await prisma.letter.update({
      where: { id },
      data: { status },
    });

    return Response.json({ letter });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
