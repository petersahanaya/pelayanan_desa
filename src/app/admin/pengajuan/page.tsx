"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Letter {
  id: string; jenisSurat: string; nik: string; namaLengkap: string; noHp: string; alamat: string;
  keperluan: string; keterangan: string | null; status: string; createdAt: string;
  user: { nama: string; nik: string };
}

const statusStyles: Record<string, string> = {
  Menunggu: "bg-amber-50 text-amber-700",
  Diproses: "bg-blue-50 text-blue-700",
  Selesai: "bg-emerald-50 text-emerald-700",
  Ditolak: "bg-red-50 text-red-700",
};

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-xs text-muted-foreground font-light ${className || ""}`}>{children}</span>;
}

export default function AdminPengajuanPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Letter | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch("/api/letters").then((r) => r.json()).then((d) => { setLetters(d.letters || []); setLoading(false); });
  }, []);

  const handleStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/letters/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLetters((p) => p.map((l) => (l.id === id ? { ...l, status } : l)));
        if (selected?.id === id) setSelected((p) => (p ? { ...p, status } : null));
      }
    } finally { setUpdating(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">Pengajuan Surat</h1>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ios-card p-4 animate-pulse space-y-2">
                <div className="h-3 bg-muted rounded-lg w-1/3" />
                <div className="h-4 bg-muted rounded-lg w-2/3" />
              </div>
            ))}
          </div>
        ) : letters.length === 0 ? (
          <div className="ios-card py-10 text-center text-muted-foreground text-sm font-light">Belum ada pengajuan surat</div>
        ) : (
          <div className="space-y-3">
            {letters.map((item) => (
              <button key={item.id} onClick={() => setSelected(item)} className="w-full text-left">
                <div className="ios-card-interactive p-4 space-y-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-medium ${statusStyles[item.status]}`}>{item.status}</span>
                  <h3 className="font-medium text-[13px]">{item.jenisSurat}</h3>
                  <p className="text-xs text-muted-foreground font-light">{item.namaLengkap}</p>
                  <p className="text-[10px] text-muted-foreground font-light">{new Date(item.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl">
            <DialogHeader><DialogTitle className="font-semibold">Detail Pengajuan</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-3">
                <div><Label>Jenis Surat</Label><p className="text-sm font-medium">{selected.jenisSurat}</p></div>
                <div><Label>NIK</Label><p className="text-sm font-medium">{selected.nik}</p></div>
                <div><Label>Nama Lengkap</Label><p className="text-sm font-medium">{selected.namaLengkap}</p></div>
                <div><Label>No. HP</Label><p className="text-sm font-medium">{selected.noHp}</p></div>
                <div><Label>Alamat</Label><p className="text-sm font-medium">{selected.alamat}</p></div>
                <div><Label>Keperluan</Label><p className="text-sm font-medium">{selected.keperluan}</p></div>
                {selected.keterangan && <div><Label>Keterangan</Label><p className="text-sm font-light">{selected.keterangan}</p></div>}
                <div><Label>Tanggal</Label><p className="text-sm font-medium">{new Date(selected.createdAt).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div>
                <Separator />
                <div>
                  <Label className="mb-2 block">Ubah Status</Label>
                  <div className="flex gap-2 flex-wrap">
                    {["Menunggu", "Diproses", "Selesai", "Ditolak"].map((s) => (
                      <Button key={s} variant={selected.status === s ? "default" : "outline"} size="sm"
                        className="rounded-xl h-9 font-medium"
                        disabled={updating || selected.status === s} onClick={() => handleStatus(selected.id, s)}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
