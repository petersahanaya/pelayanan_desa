"use client";

import CitizenLayout from "@/components/CitizenLayout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

const kategoriOptions = ["Kebersihan", "Infrastruktur", "Keamanan", "Layanan Publik", "Lainnya"];

export default function PengaduanPage() {
  const router = useRouter();
  const [form, setForm] = useState({ judul: "", kategori: "", lokasi: "", deskripsi: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setSuccess(true);
      setTimeout(() => router.push("/riwayat"), 2000);
    } catch { setError("Terjadi kesalahan."); } finally { setLoading(false); }
  };

  if (success) {
    return (
      <CitizenLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 px-5">
          <div className="flex size-16 items-center justify-center rounded-full bg-foreground/8">
            <CheckCircle2 className="size-8 text-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Pengaduan Terkirim!</h2>
            <p className="text-muted-foreground text-sm mt-1 font-light">Status: Menunggu</p>
          </div>
          <p className="text-xs text-muted-foreground font-light">Mengalihkan ke riwayat...</p>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout>
      <div className="px-5 py-5 space-y-5">
        <h1 className="text-xl font-semibold">Buat Pengaduan</h1>
        {error && <Alert variant="destructive" className="rounded-xl"><AlertDescription>{error}</AlertDescription></Alert>}
        <form onSubmit={handleSubmit}>
          <div className="ios-card p-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Kategori *</Label>
              <Select value={form.kategori} onValueChange={(v) => v && setForm({ ...form, kategori: v })}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {kategoriOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Judul *</Label>
              <Input placeholder="Ringkasan masalah" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Lokasi Kejadian *</Label>
              <Input placeholder="Contoh: Jl. Merdeka No. 10" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Deskripsi *</Label>
              <Textarea placeholder="Jelaskan masalah secara detail..." value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={5} required className="rounded-xl border-input min-h-[44px] px-3.5 py-2.5 text-[15px] font-light" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-4 h-12 rounded-xl text-[15px] font-medium">
            {loading ? "Mengirim..." : "Kirim Pengaduan"}
          </Button>
        </form>
      </div>
    </CitizenLayout>
  );
}
