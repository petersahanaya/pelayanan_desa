"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "found" | "not_found">("idle");
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: "__check__" }),
      });
      setStatus(res.status === 401 ? "found" : "found");
    } catch { setStatus("not_found"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f5f5f7] px-5">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="flex size-16 items-center justify-center rounded-[22px] bg-yellow-500 mx-auto">
            <Lock className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Lupa Password</h1>
            <p className="text-sm text-muted-foreground font-light mt-1">Cek apakah username Anda ada di sistem</p>
          </div>
        </div>

        <div className="ios-card p-6">
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium">Username</Label>
              <Input placeholder="Masukkan username Anda" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-[15px] font-medium">
              {loading ? "Mengecek..." : "Cek Username"}
            </Button>
          </form>

          {status === "found" && (
            <Alert className="mt-5 rounded-xl"><AlertDescription>
              Username <strong>{username}</strong> ditemukan. Silakan hubungi admin desa untuk reset password.
            </AlertDescription></Alert>
          )}
          {status === "not_found" && (
            <Alert variant="destructive" className="mt-5 rounded-xl"><AlertDescription>Username tidak ditemukan.</AlertDescription></Alert>
          )}

          <div className="mt-5 text-center">
            <Link href="/login" className="text-sm text-foreground font-medium active:scale-95 inline-block transition-transform">
              Kembali ke halaman masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
