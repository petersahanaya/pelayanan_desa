"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Complaint {
  id: string; judul: string; kategori: string; lokasi: string; deskripsi: string; status: string; createdAt: string;
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

export default function AdminPengaduanPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch("/api/complaints").then((r) => r.json()).then((d) => { setComplaints(d.complaints || []); setLoading(false); });
  }, []);

  const handleStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setComplaints((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));
        if (selected?.id === id) setSelected((p) => (p ? { ...p, status } : null));
      }
    } finally { setUpdating(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">Pengaduan Masyarakat</h1>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ios-card p-4 animate-pulse space-y-2">
                <div className="h-3 bg-muted rounded-lg w-1/3" />
                <div className="h-4 bg-muted rounded-lg w-2/3" />
              </div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="ios-card py-10 text-center text-muted-foreground text-sm font-light">Belum ada pengaduan</div>
        ) : (
          <div className="space-y-3">
            {complaints.map((item) => (
              <button key={item.id} onClick={() => setSelected(item)} className="w-full text-left">
                <div className="ios-card-interactive p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground font-light">{item.kategori}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-medium ${statusStyles[item.status]}`}>{item.status}</span>
                  </div>
                  <h3 className="font-medium text-[13px]">{item.judul}</h3>
                  <p className="text-xs text-muted-foreground font-light">Oleh: {item.user.nama}</p>
                  <p className="text-[10px] text-muted-foreground font-light">{new Date(item.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl">
            <DialogHeader><DialogTitle className="font-semibold">Detail Pengaduan</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-3">
                <div><Label>Judul</Label><p className="text-sm font-medium">{selected.judul}</p></div>
                <div><Label>Kategori</Label><p className="text-sm font-medium">{selected.kategori}</p></div>
                <div><Label>Pelapor</Label><p className="text-sm font-medium">{selected.user.nama} (NIK: {selected.user.nik})</p></div>
                <div><Label>Lokasi</Label><p className="text-sm font-medium">{selected.lokasi}</p></div>
                <div><Label>Deskripsi</Label><p className="text-sm font-light">{selected.deskripsi}</p></div>
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
