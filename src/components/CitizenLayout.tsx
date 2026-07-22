"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Home, Megaphone, FileText, Clock, User } from "lucide-react";

interface UserData {
  id: string;
  nama: string;
  username: string;
  role: string;
}

const navItems = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Informasi", href: "/informasi", icon: Megaphone },
  { name: "Pengaduan", href: "/pengaduan", icon: FileText },
  { name: "Surat", href: "/pengajuan", icon: FileText },
  { name: "Riwayat", href: "/riwayat", icon: Clock },
  { name: "Akun", href: "/akun", icon: User },
];

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const authChecked = useRef(false);

  useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          if (data.user.role === "admin") {
            router.push("/admin");
          }
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#f5f5f7]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-[52px] items-center justify-between px-5 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-foreground">
              <Home className="size-4 text-background" />
            </div>
            <div className="leading-tight">
              <h1 className="text-[13px] font-semibold tracking-tight">Desa Sejahtera</h1>
              <p className="text-[10px] text-muted-foreground font-light">Pelayanan Digital</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-full p-1 active:scale-95 transition-transform"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                  {user?.nama?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
              <div className="px-2.5 py-2">
                <p className="text-sm font-medium">{user?.nama}</p>
                <p className="text-xs text-muted-foreground font-light">@{user?.username}</p>
              </div>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer rounded-xl h-10 px-2.5">
                <LogOut className="mr-2 size-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full">{children}</main>

      {/* Bottom Navigation - iOS style */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
        <div className="mx-3 mb-3">
          <div className="flex items-center justify-around bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.12),0_0_1px_rgba(0,0,0,0.08)] border border-black/5 px-1 py-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground/60 active:scale-95"
                  }`}
                >
                  <div className={`relative flex items-center justify-center ${isActive ? "scale-105" : ""} transition-transform duration-200`}>
                    <Icon className="size-[22px]" strokeWidth={isActive ? 2.2 : 1.6} />
                  </div>
                  <span className={`text-[10px] leading-none ${isActive ? "font-semibold" : "font-light"}`}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom spacer for iOS nav */}
      <div className="h-24 md:hidden" />

      {/* Desktop side hint - hidden on mobile */}
      <aside className="hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 z-30">
        <div className="bg-white border border-black/5 rounded-2xl shadow-lg p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title={item.name}
              >
                <Icon className="size-4" />
                <span className="hidden xl:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
