"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User {
  id: string; nama: string; nik: string; alamat: string; username: string; role: string; createdAt: string;
}

export default function AdminMasyarakatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then((d) => { setUsers(d.users || []); setLoading(false); });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">Data Masyarakat</h1>
        {loading ? (
          <div className="ios-card p-4 animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded-lg w-1/3" />
            <div className="h-4 bg-muted rounded-lg w-2/3" />
          </div>
        ) : users.length === 0 ? (
          <div className="ios-card py-10 text-center text-muted-foreground text-sm font-light">Belum ada data</div>
        ) : (
          <div className="ios-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-black/5">
                    <TableHead className="text-xs font-medium">Nama</TableHead>
                    <TableHead className="text-xs font-medium">Username</TableHead>
                    <TableHead className="text-xs font-medium">NIK</TableHead>
                    <TableHead className="text-xs font-medium hidden sm:table-cell">Alamat</TableHead>
                    <TableHead className="text-xs font-medium">Role</TableHead>
                    <TableHead className="text-xs font-medium hidden sm:table-cell">Terdaftar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="border-black/5">
                      <TableCell className="text-xs font-medium">{u.nama}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-light">@{u.username}</TableCell>
                      <TableCell className="text-xs font-mono">{u.nik}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-light max-w-[200px] truncate hidden sm:table-cell">{u.alamat}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                          u.role === "admin" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                        }`}>{u.role}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-light hidden sm:table-cell">{new Date(u.createdAt).toLocaleDateString("id-ID")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
