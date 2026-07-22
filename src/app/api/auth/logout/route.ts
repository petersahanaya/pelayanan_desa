import { deleteSession } from "@/lib/auth";

export async function POST() {
  try {
    await deleteSession();
    return Response.json({ message: "Berhasil logout" });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
