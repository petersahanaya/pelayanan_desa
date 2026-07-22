import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.villageSetting.findUnique({
      where: { id: "singleton" },
    });

    return Response.json({ settings });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { namaDesa, kepalaDesa, alamat, telepon, email } =
      await request.json();

    const settings = await prisma.villageSetting.upsert({
      where: { id: "singleton" },
      update: {
        namaDesa,
        kepalaDesa,
        alamat,
        telepon,
        email,
      },
      create: {
        id: "singleton",
        namaDesa,
        kepalaDesa,
        alamat,
        telepon,
        email,
      },
    });

    return Response.json({ settings });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
