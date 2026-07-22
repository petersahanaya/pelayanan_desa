"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Server } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "api_base_url";
const DEFAULT_API_BASE = "http://10.0.2.2:3001";

interface VillageSettings { namaDesa: string; kepalaDesa: string; alamat: string; telepon: string; email: string; }

export default function AdminPengaturanPage() {
  const [settings, setSettings] = useState<VillageSettings>({ namaDesa: "", kepalaDesa: "", alamat: "", telepon: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [serverUrl, setServerUrl] = useState("");
  const [serverStatus, setServerStatus] = useState<"idle"|"testing"|"ok"|"error">("idle");

  useEffect(() => {
    setServerUrl(localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE);
  }, []);

  const testServer = async () => {
    setServerStatus("testing");
    try {
      const res = await fetch(`${serverUrl}/api/village-settings`, { signal: AbortSignal.timeout(5000) });
      setServerStatus(res.ok ? "ok" : "error");
    } catch { setServerStatus("error"); }
  };

  const saveServer = () => {
    localStorage.setItem(STORAGE_KEY, serverUrl);
    setMessage({ type: "success", text: "Server URL disimpan" });
  };

  useEffect(() => {
    fetch("/api/village-settings").then((r) => r.json()).then((d) => { if (d.settings) setSettings(d.settings); setLoading(false); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/village-settings", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings),
      });
      setMessage(res.ok ? { type: "success", text: "Berhasil disimpan" } : { type: "error", text: "Gagal menyimpan" });
    } catch { setMessage({ type: "error", text: "Terjadi kesalahan" }); } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-2xl">
        <h1 className="text-2xl font-semibold">Pengaturan Desa</h1>
        {message.text && (
          <Alert variant={message.type === "success" ? "default" : "destructive"} className="rounded-xl">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="ios-card p-6 animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="space-y-2"><div className="h-4 bg-muted rounded-lg w-24" /><div className="h-11 bg-muted rounded-xl" /></div>)}
          </div>
        ) : (
          <div className="ios-card p-5 space-y-4">
            <h3 className="font-semibold text-sm">Informasi Desa</h3>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-2"><Label className="text-[13px] font-medium">Nama Desa</Label><Input value={settings.namaDesa} onChange={(e) => setSettings({ ...settings, namaDesa: e.target.value })} required /></div>
              <div className="space-y-2"><Label className="text-[13px] font-medium">Kepala Desa</Label><Input value={settings.kepalaDesa} onChange={(e) => setSettings({ ...settings, kepalaDesa: e.target.value })} required /></div>
              <div className="space-y-2"><Label className="text-[13px] font-medium">Alamat</Label><Textarea rows={2} value={settings.alamat} onChange={(e) => setSettings({ ...settings, alamat: e.target.value })} required className="rounded-xl border-input min-h-[44px] px-3.5 py-2.5 text-[15px] font-light" /></div>
              <div className="space-y-2"><Label className="text-[13px] font-medium">Telepon</Label><Input type="tel" value={settings.telepon} onChange={(e) => setSettings({ ...settings, telepon: e.target.value })} required /></div>
              <div className="space-y-2"><Label className="text-[13px] font-medium">Email</Label><Input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} required /></div>
              <Button type="submit" disabled={saving} className="w-full h-11 rounded-xl font-medium">{saving ? "Menyimpan..." : "Simpan Pengaturan"}</Button>
            </form>
          </div>
        )}

        <div className="ios-card p-5 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Server className="size-4" /> Server Mobile App</h3>
          <p className="text-sm text-muted-foreground font-light">
            IP address ini digunakan oleh aplikasi mobile (Capacitor) untuk terhubung ke backend.
          </p>
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
      </div>
    </AdminLayout>
  );
}
