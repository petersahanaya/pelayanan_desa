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

const jenisSuratOptions = [
  "Surat Keterangan Domisili", "Surat Keterangan Usaha", "Surat Pengantar Nikah",
  "Surat Keterangan Tidak Mampu", "Surat Keterangan Kelahiran",
  "Surat Keterangan Kematian", "Surat Lainnya",
];

export default function PengajuanPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    jenisSurat: "", nik: "", namaLengkap: "", noHp: "", alamat: "", keperluan: "", keterangan: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/letters", {
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
            <h2 className="text-xl font-semibold">Pengajuan Terkirim!</h2>
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
        <h1 className="text-xl font-semibold">Pengajuan Surat</h1>
        {error && <Alert variant="destructive" className="rounded-xl"><AlertDescription>{error}</AlertDescription></Alert>}
        <form onSubmit={handleSubmit}>
          <div className="ios-card p-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Jenis Surat *</Label>
              <Select value={form.jenisSurat} onValueChange={(v) => v && setForm({ ...form, jenisSurat: v })}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Pilih jenis surat" /></SelectTrigger>
                <SelectContent>
                  {jenisSuratOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">NIK *</Label>
              <Input placeholder="16 digit NIK" maxLength={16} value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Nama Lengkap *</Label>
              <Input placeholder="Nama lengkap" value={form.namaLengkap} onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">No. HP *</Label>
              <Input type="tel" placeholder="Nomor HP" value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Alamat *</Label>
              <Textarea placeholder="Alamat lengkap" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} rows={2} required className="rounded-xl border-input min-h-[44px] px-3.5 py-2.5 text-[15px] font-light" />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Keperluan *</Label>
              <Input placeholder="Contoh: Untuk keperluan administrasi" value={form.keperluan} onChange={(e) => setForm({ ...form, keperluan: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Keterangan Tambahan</Label>
              <Textarea placeholder="Informasi tambahan (opsional)" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} rows={3} className="rounded-xl border-input min-h-[44px] px-3.5 py-2.5 text-[15px] font-light" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-4 h-12 rounded-xl text-[15px] font-medium">
            {loading ? "Mengirim..." : "Kirim Pengajuan"}
          </Button>
        </form>
      </div>
    </CitizenLayout>
  );
}
