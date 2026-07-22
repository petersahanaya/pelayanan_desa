"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nama: "", nik: "", alamat: "", username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirmPassword) { setError("Password dan konfirmasi tidak cocok"); return; }
    if (form.password.length < 6) { setError("Password minimal 6 karakter"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: form.nama, nik: form.nik, alamat: form.alamat, username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/"); router.refresh();
    } catch { setError("Terjadi kesalahan."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f5f5f7] px-5 py-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="flex size-16 items-center justify-center rounded-[22px] bg-foreground mx-auto">
            <Building2 className="size-8 text-background" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Daftar Akun Baru</h1>
            <p className="text-sm text-muted-foreground font-light mt-1">Isi data diri Anda</p>
          </div>
        </div>

        <div className="ios-card p-6">
          {error && (
            <Alert variant="destructive" className="mb-5 rounded-xl"><AlertDescription>{error}</AlertDescription></Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Nama Lengkap</Label>
              <Input placeholder="Nama lengkap" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">NIK</Label>
              <Input placeholder="16 digit NIK" maxLength={16} value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Alamat</Label>
              <Textarea placeholder="Alamat lengkap" rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} required className="rounded-xl border-input min-h-[44px] px-3.5 py-2.5 text-[15px] font-light" />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Username</Label>
              <Input placeholder="Buat username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Password</Label>
              <Input type="password" placeholder="Minimal 6 karakter" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Konfirmasi Password</Label>
              <Input type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-[15px] font-medium mt-2">
              {loading ? "Mendaftar..." : "Daftar"}
            </Button>
          </form>
          <div className="mt-5 text-center">
            <Link href="/login" className="text-sm text-foreground font-medium active:scale-95 inline-block transition-transform">
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
