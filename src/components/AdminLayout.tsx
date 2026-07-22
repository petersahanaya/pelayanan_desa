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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  Building2,
} from "lucide-react";

interface UserData {
  id: string;
  nama: string;
  username: string;
  role: string;
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Pengaduan", href: "/admin/pengaduan", icon: Megaphone },
  { name: "Pengajuan Surat", href: "/admin/pengajuan", icon: FileText },
  { name: "Informasi", href: "/admin/informasi", icon: FileText },
  { name: "Data Masyarakat", href: "/admin/masyarakat", icon: Users },
  { name: "Pengaturan Desa", href: "/admin/pengaturan", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [open, setOpen] = useState(false);
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
          if (data.user.role !== "admin") {
            router.push("/");
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

  const currentPage = navItems.find((i) => i.href === pathname)?.name || "Dashboard";

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="flex flex-col gap-0.5 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f5f5f7]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-60 flex-col border-r border-black/5 bg-white">
        <div className="flex h-[52px] items-center gap-2.5 border-b border-black/5 px-4">
          <div className="flex size-8 items-center justify-center rounded-xl bg-foreground">
            <Building2 className="size-4 text-background" />
          </div>
          <div className="leading-tight">
            <h1 className="text-[13px] font-semibold tracking-tight">Admin Panel</h1>
            <p className="text-[10px] text-muted-foreground font-light">Desa Sejahtera</p>
          </div>
        </div>
        <NavLinks />
      </aside>

      {/* Main Content */}
      <div className="md:ml-60">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-[52px] items-center gap-4 border-b border-black/5 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 px-5">
          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex items-center justify-center size-9 shrink-0 rounded-xl hover:bg-muted md:hidden active:scale-95 transition-all"
            >
              <Menu className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0 bg-white">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-[52px] items-center gap-2.5 border-b border-black/5 px-4">
                <div className="flex size-8 items-center justify-center rounded-xl bg-foreground">
                  <Building2 className="size-4 text-background" />
                </div>
                <div className="leading-tight">
                  <h1 className="text-[13px] font-semibold tracking-tight">Admin Panel</h1>
                  <p className="text-[10px] text-muted-foreground font-light">Desa Sejahtera</p>
                </div>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <h2 className="text-base font-semibold">{currentPage}</h2>

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="relative inline-flex items-center justify-center size-9 rounded-full bg-muted active:scale-95 transition-transform">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                      {user?.nama?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
                <div className="px-2.5 py-2">
                  <p className="text-sm font-medium">{user?.nama}</p>
                  <p className="text-xs text-muted-foreground font-light">Administrator</p>
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

        <main className="p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
