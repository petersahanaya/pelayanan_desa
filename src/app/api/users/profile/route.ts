import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nama, alamat, oldPassword, newPassword } = body;

    // Update profile
    if (nama !== undefined || alamat !== undefined) {
      const updateData: { nama?: string; alamat?: string } = {};
      if (nama) updateData.nama = nama;
      if (alamat) updateData.alamat = alamat;

      await prisma.user.update({
        where: { id: session.userId },
        data: updateData,
      });
    }

    // Change password
    if (oldPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
      });

      if (!user) {
        return Response.json({ error: "User tidak ditemukan" }, { status: 404 });
      }

      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        return Response.json(
          { error: "Password lama salah" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: session.userId },
        data: { password: hashedPassword },
      });
    }

    return Response.json({ message: "Profil berhasil diperbarui" });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
