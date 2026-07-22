"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(data.user.role === "admin" ? "/admin" : "/");
      router.refresh();
    } catch { setError("Terjadi kesalahan."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f5f5f7] px-5">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="flex size-16 items-center justify-center rounded-[22px] bg-foreground mx-auto">
            <Building2 className="size-8 text-background" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Pelayanan Desa</h1>
            <p className="text-sm text-muted-foreground font-light mt-1">Masuk ke akun Anda</p>
          </div>
        </div>

        <div className="ios-card p-6">
          {error && (
            <Alert variant="destructive" className="mb-5 rounded-xl"><AlertDescription>{error}</AlertDescription></Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Username</Label>
              <Input placeholder="Masukkan username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Password</Label>
              <Input id="password" type="password" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-[15px] font-medium">
              {loading ? "Masuk..." : "Masuk"}
            </Button>
          </form>
          <div className="mt-5 text-center space-y-3">
            <Link href="/register" className="text-sm text-foreground font-medium active:scale-95 inline-block transition-transform">
              Belum punya akun? Daftar sekarang
            </Link>
            <p className="text-xs text-muted-foreground font-light">atau</p>
            <Link href="/forgot-password" className="text-sm text-muted-foreground font-light active:scale-95 inline-block transition-transform">
              Lupa password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
