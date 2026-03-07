"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileDown,
  ImageDown,
  FilePlus2,
  Scissors,
  ArrowRightLeft,
  LogOut,
  LayoutDashboard,
  Menu,
  Zap,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useTheme } from "next-themes";

const tools = [
  { title: "Compress Image", href: "/compress-image", icon: ImageDown, desc: "JPEG, PNG, WebP" },
  { title: "Compress PDF", href: "/compress-pdf", icon: FileDown, desc: "Shrink PDF files" },
  { title: "Merge PDF", href: "/merge-pdf", icon: FilePlus2, desc: "Combine PDFs" },
  { title: "Split PDF", href: "/split-pdf", icon: Scissors, desc: "Extract pages" },
  { title: "Convert", href: "/convert", icon: ArrowRightLeft, desc: "Format conversion" },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl group">
            <div className="rounded-lg bg-primary p-1.5 group-hover:shadow-lg group-hover:shadow-primary/25 transition-shadow">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>CompressX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <span className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}>
                  Tools
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2">
                {tools.map((tool) => (
                  <DropdownMenuItem key={tool.href} className="p-0">
                    <Link href={tool.href} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <tool.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tool.title}</p>
                        <p className="text-xs text-muted-foreground">{tool.desc}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/#pricing"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Pricing
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-2.5 rounded-full border border-border/50 bg-muted/50 pl-1 pr-3 py-1 hover:bg-muted transition-colors cursor-pointer">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-[11px] font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {session.user.name || session.user.email}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-2">
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-medium truncate">{session.user.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <Link href="/dashboard" className="flex items-center gap-2 w-full px-3 py-2 rounded-md">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Sign in
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "shadow-sm shadow-primary/20")}>
                Get Started
              </Link>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col gap-1 mt-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Tools
              </p>
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                    pathname === tool.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="rounded-md bg-muted p-1.5">
                    <tool.icon className="h-4 w-4" />
                  </div>
                  {tool.title}
                </Link>
              ))}
              <div className="border-t mt-4 pt-4 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute ml-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="ml-5">Toggle theme</span>
                </Button>
                {session?.user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{session.user.name || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-start gap-2")}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-start")}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
