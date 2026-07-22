"use client";

import { useEffect, useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Wifi, WifiOff, CheckCircle2 } from "lucide-react";

const DEFAULT_API_BASE = "http://10.0.2.2:3001";
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];
const STORAGE_KEY = "api_base_url";

function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_API_BASE;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE;
}

function setApiBase(url: string) {
  localStorage.setItem(STORAGE_KEY, url);
}

function SettingsPanel({ onSaved }: { onSaved: () => void }) {
  const [url, setUrl] = useState(getApiBase());
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const testConnection = async () => {
    setTesting(true); setStatus("idle");
    try {
      const res = await fetch(`${url}/api/village-settings`, { signal: AbortSignal.timeout(5000) });
      setStatus(res.ok ? "ok" : "error");
    } catch { setStatus("error"); } finally { setTesting(false); }
  };

  const save = () => {
    setApiBase(url);
    onSaved();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2">
            <Settings className="size-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Pengaturan Server</CardTitle>
          <p className="text-sm text-muted-foreground">Masukkan IP address backend server</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Server URL</Label>
            <Input
              value={url}
              onChange={(e) => { setUrl(e.target.value); setStatus("idle"); }}
              placeholder="http://192.168.1.x:3001"
            />
            <p className="text-[10px] text-muted-foreground">
              Contoh: http://10.0.2.2:3001 (emulator) atau http://192.168.1.5:3001 (device)
            </p>
          </div>

          {status === "ok" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="size-4" /> Server terhubung!
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <WifiOff className="size-4" /> Server tidak dapat dijangkau
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={testConnection} disabled={testing} className="flex-1">
              <Wifi className="size-4 mr-1" />
              {testing ? "Testing..." : "Test"}
            </Button>
            <Button onClick={save} className="flex-1">Simpan</Button>
          </div>

          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onSaved}>
            Lewati
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [key, setKey] = useState(0); // Force re-render on settings change

  const checkAndInit = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      setReady(true);
      return;
    }

    const apiBase = getApiBase();

    // Override fetch to rewrite /api/* paths
    const originalFetch = window.fetch;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      let url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.startsWith("/api/")) {
        url = `${apiBase}${url}`;
      }
      return originalFetch.call(window, url, init);
    };

    // Check auth for protected pages
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (!isPublic) {
      try {
        const res = await fetch(`${apiBase}/api/auth/me`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        if (!data.user) router.push("/login");
        setReady(true);
      } catch {
        // Server not reachable, show settings
        setShowSettings(true);
        setReady(false);
      }
    } else {
      setReady(true);
    }

    return () => { window.fetch = originalFetch; };
  }, [pathname, router, key]);

  useEffect(() => { checkAndInit(); }, [checkAndInit]);

  const handleSettingsSaved = () => {
    setShowSettings(false);
    setReady(false);
    setKey((k) => k + 1); // Force re-init
  };

  if (showSettings) {
    return <SettingsPanel onSaved={handleSettingsSaved} />;
  }

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
