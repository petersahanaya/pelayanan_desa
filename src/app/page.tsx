"use client";

import CitizenLayout from "@/components/CitizenLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Megaphone, FileText } from "lucide-react";

interface Information {
  id: string;
  judul: string;
  kategori: string;
  ringkasan: string;
  tanggal: string;
}

interface UserData {
  nama: string;
}

export default function HomePage() {
  const [informations, setInformations] = useState<Information[]>([]);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
    fetch("/api/information?limit=5").then((r) => r.json()).then((d) => setInformations(d.informations || []));
  }, []);

  return (
    <CitizenLayout>
      <div className="px-5 py-5 space-y-6">
        {/* Greeting */}
        <div className="bg-foreground text-background rounded-3xl p-5">
          <p className="text-background/60 text-xs font-light tracking-wide uppercase mb-1">Selamat datang</p>
          <h2 className="text-lg font-semibold">{user?.nama || "Warga"}!</h2>
          <p className="text-background/60 text-sm mt-0.5 font-light">
            Layanan desa dalam genggaman Anda
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Akses Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/pengaduan">
              <div className="ios-card-interactive p-5 flex flex-col items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/8">
                  <Megaphone className="size-6 text-destructive" />
                </div>
                <span className="text-[13px] font-medium text-center">Buat Pengaduan</span>
              </div>
            </Link>
            <Link href="/pengajuan">
              <div className="ios-card-interactive p-5 flex flex-col items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/8">
                  <FileText className="size-6 text-foreground" />
                </div>
                <span className="text-[13px] font-medium text-center">Ajukan Surat</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Latest Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Informasi Terbaru</h3>
            <Link href="/informasi" className="text-xs text-foreground font-medium active:scale-95 transition-transform">
              Lihat Semua
            </Link>
          </div>

          {informations.length === 0 ? (
            <div className="ios-card py-10 text-center text-muted-foreground text-sm font-light">
              Belum ada informasi
            </div>
          ) : (
            <div className="space-y-3">
              {informations.map((info) => (
                <Link key={info.id} href={`/informasi?id=${info.id}`}>
                  <div className="ios-card-interactive p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                        info.kategori === "Berita"
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {info.kategori}
                      </span>
                    </div>
                    <h4 className="font-medium text-[13px] line-clamp-1">{info.judul}</h4>
                    <p className="text-xs text-muted-foreground font-light line-clamp-2">{info.ringkasan}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </CitizenLayout>
  );
}
