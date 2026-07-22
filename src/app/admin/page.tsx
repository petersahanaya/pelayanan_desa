"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Megaphone, FileText, Users, BarChart3 } from "lucide-react";

interface Stats { information: number; complaints: number; letters: number; users: number; }
interface StatusCount { status: string; count: number; }

const statusStyles: Record<string, string> = {
  Menunggu: "bg-amber-50 text-amber-700",
  Diproses: "bg-blue-50 text-blue-700",
  Selesai: "bg-emerald-50 text-emerald-700",
  Ditolak: "bg-red-50 text-red-700",
};

const statCards = [
  { name: "Informasi", key: "information" as const, icon: BarChart3, color: "text-blue-600 bg-blue-50" },
  { name: "Pengaduan", key: "complaints" as const, icon: Megaphone, color: "text-red-600 bg-red-50" },
  { name: "Pengajuan Surat", key: "letters" as const, icon: FileText, color: "text-emerald-600 bg-emerald-50" },
  { name: "Masyarakat", key: "users" as const, icon: Users, color: "text-purple-600 bg-purple-50" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [complaintsByStatus, setComplaintsByStatus] = useState<StatusCount[]>([]);
  const [lettersByStatus, setLettersByStatus] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data.statistics); setComplaintsByStatus(data.complaintsByStatus || []); setLettersByStatus(data.lettersByStatus || []);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <button
            onClick={() => { setRefreshing(true); fetchData(); }}
            disabled={refreshing}
            className="size-9 flex items-center justify-center rounded-xl bg-white border border-black/5 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.name} className="ios-card p-4 flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-light">{card.name}</p>
                  <p className="text-2xl font-semibold">{loading ? "-" : (stats?.[card.key] || 0)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="ios-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Status Pengaduan</h3>
            {complaintsByStatus.length === 0 ? (
              <p className="text-xs text-muted-foreground font-light">Belum ada data</p>
            ) : complaintsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-medium ${statusStyles[item.status]}`}>{item.status}</span>
                <span className="text-sm font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="ios-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Status Pengajuan Surat</h3>
            {lettersByStatus.length === 0 ? (
              <p className="text-xs text-muted-foreground font-light">Belum ada data</p>
            ) : lettersByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-medium ${statusStyles[item.status]}`}>{item.status}</span>
                <span className="text-sm font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
