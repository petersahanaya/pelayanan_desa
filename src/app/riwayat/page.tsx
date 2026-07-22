"use client";

import CitizenLayout from "@/components/CitizenLayout";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

interface Complaint { id: string; judul: string; kategori: string; status: string; createdAt: string; }
interface Letter { id: string; jenisSurat: string; namaLengkap: string; status: string; createdAt: string; }

const statusStyles: Record<string, string> = {
  Menunggu: "bg-amber-50 text-amber-700",
  Diproses: "bg-blue-50 text-blue-700",
  Selesai: "bg-emerald-50 text-emerald-700",
  Ditolak: "bg-red-50 text-red-700",
};

export default function RiwayatPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"pengaduan" | "pengajuan">("pengaduan");

  const fetchData = async () => {
    try {
      const [c, l] = await Promise.all([fetch("/api/complaints"), fetch("/api/letters")]);
      const cd = await c.json(); const ld = await l.json();
      setComplaints(cd.complaints || []); setLetters(ld.letters || []);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const items = tab === "pengaduan" ? complaints : letters;

  return (
    <CitizenLayout>
      <div className="px-5 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Riwayat</h1>
          <button
            onClick={() => { setRefreshing(true); fetchData(); }}
            disabled={refreshing}
            className="size-9 flex items-center justify-center rounded-xl bg-white border border-black/5 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* iOS-style segmented control */}
        <div className="bg-muted/60 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setTab("pengaduan")}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
              tab === "pengaduan"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Pengaduan ({complaints.length})
          </button>
          <button
            onClick={() => setTab("pengajuan")}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
              tab === "pengajuan"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Pengajuan Surat ({letters.length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ios-card p-4 animate-pulse space-y-2">
                <div className="h-3 bg-muted rounded-lg w-1/3" />
                <div className="h-4 bg-muted rounded-lg w-2/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="ios-card py-10 text-center text-muted-foreground text-sm font-light">
            {tab === "pengaduan" ? "Belum ada pengaduan" : "Belum ada pengajuan surat"}
          </div>
        ) : (
          <div className="space-y-3">
            {tab === "pengaduan" ? (
              complaints.map((item) => (
                <div key={item.id} className="ios-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-light">{item.kategori}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-medium ${statusStyles[item.status]}`}>{item.status}</span>
                  </div>
                  <h3 className="font-medium text-[13px]">{item.judul}</h3>
                  <p className="text-[10px] text-muted-foreground font-light">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))
            ) : (
              letters.map((item) => (
                <div key={item.id} className="ios-card p-4 space-y-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-medium ${statusStyles[item.status]}`}>{item.status}</span>
                  <h3 className="font-medium text-[13px]">{item.jenisSurat}</h3>
                  <p className="text-xs text-muted-foreground font-light">{item.namaLengkap}</p>
                  <p className="text-[10px] text-muted-foreground font-light">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}
