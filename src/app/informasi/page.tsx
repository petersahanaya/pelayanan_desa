"use client";

import { Suspense } from "react";
import CitizenLayout from "@/components/CitizenLayout";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Information {
  id: string;
  judul: string;
  kategori: string;
  ringkasan: string;
  konten: string;
  tanggal: string;
}

function InformasiContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const [informations, setInformations] = useState<Information[]>([]);
  const [filter, setFilter] = useState("Semua");
  const [selectedInfo, setSelectedInfo] = useState<Information | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = filter === "Semua" ? "/api/information" : `/api/information?kategori=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setInformations(d.informations || []); setLoading(false); });
  }, [filter]);

  useEffect(() => {
    if (selectedId && informations.length > 0) {
      const info = informations.find((i) => i.id === selectedId);
      if (info) setSelectedInfo(info);
    }
  }, [selectedId, informations]);

  if (selectedInfo) {
    return (
      <CitizenLayout>
        <div className="px-5 py-5 space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedInfo(null)} className="gap-1.5 h-9 rounded-xl px-3 font-medium active:scale-95 transition-transform">
            <ArrowLeft className="size-4" /> Kembali
          </Button>
          <div className="ios-card p-5 space-y-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium ${
              selectedInfo.kategori === "Berita" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
            }`}>
              {selectedInfo.kategori}
            </span>
            <h1 className="text-xl font-semibold">{selectedInfo.judul}</h1>
            <p className="text-xs text-muted-foreground font-light">
              {new Date(selectedInfo.tanggal).toLocaleDateString("id-ID", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
            <div className="text-sm leading-relaxed whitespace-pre-line text-foreground font-light">
              {selectedInfo.konten}
            </div>
          </div>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout>
      <div className="px-5 py-5 space-y-5">
        <h1 className="text-xl font-semibold">Informasi Desa</h1>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {["Semua", "Berita", "Pengumuman"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-[13px] font-medium transition-all active:scale-95 ${
                filter === cat
                  ? "bg-foreground text-background"
                  : "bg-white text-muted-foreground border border-black/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ios-card p-4 animate-pulse space-y-2.5">
                <div className="h-3 bg-muted rounded-lg w-16" />
                <div className="h-4 bg-muted rounded-lg w-3/4" />
                <div className="h-3 bg-muted rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : informations.length === 0 ? (
          <div className="ios-card py-10 text-center text-muted-foreground text-sm font-light">
            Tidak ada informasi
          </div>
        ) : (
          <div className="space-y-3">
            {informations.map((info) => (
              <button key={info.id} onClick={() => setSelectedInfo(info)} className="w-full text-left">
                <div className="ios-card-interactive p-4 space-y-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                    info.kategori === "Berita" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                  }`}>
                    {info.kategori}
                  </span>
                  <h3 className="font-medium text-[13px]">{info.judul}</h3>
                  <p className="text-xs text-muted-foreground font-light line-clamp-2">{info.ringkasan}</p>
                  <p className="text-[10px] text-muted-foreground font-light">
                    {new Date(info.tanggal).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}

export default function InformasiPage() {
  return (
    <Suspense fallback={
      <CitizenLayout>
        <div className="px-5 py-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ios-card p-4 animate-pulse space-y-2.5">
              <div className="h-3 bg-muted rounded-lg w-16" />
              <div className="h-4 bg-muted rounded-lg w-3/4" />
            </div>
          ))}
        </div>
      </CitizenLayout>
    }>
      <InformasiContent />
    </Suspense>
  );
}
