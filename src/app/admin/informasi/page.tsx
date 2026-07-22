"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Information { id: string; judul: string; kategori: string; ringkasan: string; konten: string; tanggal: string; }

export default function AdminInformasiPage() {
  const [informations, setInformations] = useState<Information[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ judul: "", kategori: "Berita", ringkasan: "", konten: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/information").then((r) => r.json()).then((d) => { setInformations(d.informations || []); setLoading(false); });
  }, []);

  const resetForm = () => { setForm({ judul: "", kategori: "Berita", ringkasan: "", konten: "" }); setEditingId(null); setShowForm(false); };

  const handleEdit = (info: Information) => {
    setForm({ judul: info.judul, kategori: info.kategori, ringkasan: info.ringkasan, konten: info.konten });
    setEditingId(info.id); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const url = editingId ? `/api/information/${editingId}` : "/api/information";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        const data = await res.json();
        if (editingId) setInformations((p) => p.map((i) => (i.id === editingId ? data.information : i)));
        else setInformations((p) => [data.information, ...p]);
        resetForm();
      }
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/information/${id}`, { method: "DELETE" });
    if (res.ok) { setInformations((p) => p.filter((i) => i.id !== id)); setDeleteConfirm(null); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Informasi Desa</h1>
          <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="rounded-xl h-9 font-medium"><Plus className="size-4 mr-1" /> Tambah</Button>
        </div>

        <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl">
            <DialogHeader><DialogTitle className="font-semibold">{editingId ? "Edit" : "Tambah"} Informasi</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label className="text-[13px] font-medium">Judul *</Label><Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required /></div>
              <div className="space-y-2"><Label className="text-[13px] font-medium">Kategori *</Label>
                <Select value={form.kategori} onValueChange={(v) => v && setForm({ ...form, kategori: v })}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Berita">Berita</SelectItem><SelectItem value="Pengumuman">Pengumuman</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-[13px] font-medium">Ringkasan *</Label><Textarea rows={2} value={form.ringkasan} onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} required className="rounded-xl border-input min-h-[44px] px-3.5 py-2.5 text-[15px] font-light" /></div>
              <div className="space-y-2"><Label className="text-[13px] font-medium">Konten *</Label><Textarea rows={6} value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} required className="rounded-xl border-input min-h-[44px] px-3.5 py-2.5 text-[15px] font-light" /></div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="flex-1 h-11 rounded-xl font-medium">{submitting ? "Menyimpan..." : "Simpan"}</Button>
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl font-medium" onClick={resetForm}>Batal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader><AlertDialogTitle className="font-semibold">Hapus Informasi?</AlertDialogTitle><AlertDialogDescription className="font-light">Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel className="rounded-xl font-medium">Batal</AlertDialogCancel><AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="rounded-xl font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ios-card p-4 animate-pulse space-y-2">
                <div className="h-3 bg-muted rounded-lg w-1/3" />
                <div className="h-4 bg-muted rounded-lg w-2/3" />
              </div>
            ))}
          </div>
        ) : informations.length === 0 ? (
          <div className="ios-card py-10 text-center text-muted-foreground text-sm font-light">Belum ada informasi</div>
        ) : (
          <div className="space-y-3">
            {informations.map((info) => (
              <div key={info.id} className="ios-card p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                    info.kategori === "Berita" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                  }`}>{info.kategori}</span>
                  <h3 className="font-medium text-[13px]">{info.judul}</h3>
                  <p className="text-xs text-muted-foreground font-light line-clamp-2">{info.ringkasan}</p>
                  <p className="text-[10px] text-muted-foreground font-light">{new Date(info.tanggal).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(info)} className="size-8 flex items-center justify-center rounded-xl hover:bg-muted active:scale-95 transition-all">
                    <Pencil className="size-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(info.id)} className="size-8 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-destructive active:scale-95 transition-all">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
