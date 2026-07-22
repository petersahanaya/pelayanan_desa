"use client";

import CitizenLayout from "@/components/CitizenLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, LogOut, Pencil, ArrowLeft, Server } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const STORAGE_KEY = "api_base_url";
const DEFAULT_API_BASE = "http://10.0.2.2:3001";

interface UserData {
  id: string; nama: string; nik: string; alamat: string; username: string; noHp: string | null; createdAt: string;
}

export default function AkunPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState({ nama: "", alamat: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [serverDialogOpen, setServerDialogOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [serverStatus, setServerStatus] = useState<"idle"|"testing"|"ok"|"error">("idle");

  useEffect(() => {
    if (serverDialogOpen) {
      setServerUrl(localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE);
      setServerStatus("idle");
    }
  }, [serverDialogOpen]);

  const testServer = async () => {
    setServerStatus("testing");
    try {
      const res = await fetch(`${serverUrl}/api/village-settings`, { signal: AbortSignal.timeout(5000) });
      setServerStatus(res.ok ? "ok" : "error");
    } catch { setServerStatus("error"); }
  };

  const saveServer = () => {
    localStorage.setItem(STORAGE_KEY, serverUrl);
    setServerDialogOpen(false);
  };

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) { setUser(d.user); setForm({ nama: d.user.nama, alamat: d.user.alamat }); }
    });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: data.error }); return; }
      setMessage({ type: "success", text: "Profil berhasil diperbarui" });
      setEditing(false); if (user) setUser({ ...user, ...form });
    } catch { setMessage({ type: "error", text: "Terjadi kesalahan" }); } finally { setLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage({ type: "", text: "" });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Password baru tidak cocok" }); setLoading(false); return;
    }
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: data.error }); return; }
      setMessage({ type: "success", text: "Password berhasil diubah" });
      setChangingPassword(false); setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch { setMessage({ type: "error", text: "Terjadi kesalahan" }); } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh();
  };

  return (
    <CitizenLayout>
      <div className="px-5 py-5 space-y-5">
        <h1 className="text-xl font-semibold">Akun Saya</h1>
        {message.text && (
          <Alert variant={message.type === "success" ? "default" : "destructive"} className="rounded-xl">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Profile Header */}
        <div className="ios-card p-5 flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-muted text-foreground text-lg font-medium">
              {user?.nama?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-base">{user?.nama}</h2>
            <p className="text-sm text-muted-foreground font-light">@{user?.username}</p>
          </div>
        </div>

        {editing ? (
          <div className="ios-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(false)} className="size-8 flex items-center justify-center rounded-xl bg-muted active:scale-95 transition-transform">
                <ArrowLeft className="size-4" />
              </button>
              <h3 className="font-semibold text-base">Edit Profil</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Nama</Label>
                <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Alamat</Label>
                <Textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} rows={3} required className="rounded-xl border-input min-h-[44px] px-3.5 py-2.5 text-[15px] font-light" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl font-medium">{loading ? "Menyimpan..." : "Simpan"}</Button>
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl font-medium" onClick={() => setEditing(false)}>Batal</Button>
              </div>
            </form>
          </div>
        ) : changingPassword ? (
          <div className="ios-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setChangingPassword(false)} className="size-8 flex items-center justify-center rounded-xl bg-muted active:scale-95 transition-transform">
                <ArrowLeft className="size-4" />
              </button>
              <h3 className="font-semibold text-base">Ubah Password</h3>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Password Lama</Label>
                <Input type="password" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Password Baru</Label>
                <Input type="password" minLength={6} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Konfirmasi Password Baru</Label>
                <Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl font-medium">{loading ? "Menyimpan..." : "Ubah Password"}</Button>
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl font-medium" onClick={() => setChangingPassword(false)}>Batal</Button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="ios-card p-5 space-y-3.5">
              {[
                ["NIK", user?.nik],
                ["No. HP", user?.noHp || "-"],
                ["Alamat", user?.alamat],
                ["Terdaftar", user?.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID") : "-"],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground font-light">{label}</span>
                  <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              <button onClick={() => setEditing(true)} className="ios-card-interactive w-full flex items-center gap-3 px-5 py-3.5 text-left">
                <Pencil className="size-4 text-muted-foreground" />
                <span className="text-[15px] font-medium">Edit Profil</span>
              </button>
              <button onClick={() => setChangingPassword(true)} className="ios-card-interactive w-full flex items-center gap-3 px-5 py-3.5 text-left">
                <Lock className="size-4 text-muted-foreground" />
                <span className="text-[15px] font-medium">Ubah Password</span>
              </button>
              <button onClick={() => setServerDialogOpen(true)} className="ios-card-interactive w-full flex items-center gap-3 px-5 py-3.5 text-left">
                <Server className="size-4 text-muted-foreground" />
                <span className="text-[15px] font-medium">Ganti Server</span>
              </button>
              <div className="h-px bg-black/5 mx-2" />
              <button onClick={handleLogout} className="ios-card-interactive w-full flex items-center gap-3 px-5 py-3.5 text-left text-destructive">
                <LogOut className="size-4" />
                <span className="text-[15px] font-medium">Keluar</span>
              </button>
            </div>
          </>
        )}

        <Dialog open={serverDialogOpen} onOpenChange={setServerDialogOpen}>
          <DialogContent className="sm:max-w-sm rounded-2xl">
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Server className="size-5 text-foreground" />
                <h2 className="font-semibold">Ganti Server</h2>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Server URL</Label>
                <Input value={serverUrl} onChange={(e) => { setServerUrl(e.target.value); setServerStatus("idle"); }}
                  placeholder="http://192.168.1.x:3001" />
                <p className="text-[10px] text-muted-foreground font-light">
                  Emulator: http://10.0.2.2:3001 | Device: http://IP_KOMPUTER:3001
                </p>
              </div>
              {serverStatus === "ok" && <p className="text-sm text-green-600">Server terhubung!</p>}
              {serverStatus === "error" && <p className="text-sm text-destructive">Server tidak dapat dijangkau</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={testServer} disabled={serverStatus === "testing"} className="flex-1 h-11 rounded-xl font-medium">
                  {serverStatus === "testing" ? "Testing..." : "Test Koneksi"}
                </Button>
                <Button onClick={saveServer} className="flex-1 h-11 rounded-xl font-medium">Simpan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CitizenLayout>
  );
}
