import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const [informationCount, complaintsCount, lettersCount, usersCount] =
      await Promise.all([
        prisma.information.count(),
        prisma.complaint.count(),
        prisma.letter.count(),
        prisma.user.count({ where: { role: "warga" } }),
      ]);

    const complaintsByStatus = await prisma.complaint.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const lettersByStatus = await prisma.letter.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    return Response.json({
      statistics: {
        information: informationCount,
        complaints: complaintsCount,
        letters: lettersCount,
        users: usersCount,
      },
      complaintsByStatus: complaintsByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      lettersByStatus: lettersByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
    });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
