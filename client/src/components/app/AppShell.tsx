import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Pill,
  HeartPulse,
  Users,
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  LifeBuoy,
  HeartHandshake,
  Plus,
  X,
  Menu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";

const nav = [
  { to: "/dashboard", label: "Today", icon: LayoutDashboard },
  { to: "/medications", label: "Medications", icon: Pill },
  { to: "/wellness", label: "Wellness", icon: HeartPulse },
  { to: "/circle", label: "Family Circle", icon: Users },
  { to: "/assistant", label: "Assistant", icon: Sparkles },
  { to: "/analytics", label: "Insights", icon: BarChart3 },
] as const;

const secondaryNav = [
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/help", label: "Help & Feedback", icon: HeartHandshake },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const mobileNav = [
  { to: "/dashboard", label: "Today", icon: LayoutDashboard },
  { to: "/medications", label: "Meds", icon: Pill },
  { to: "/circle", label: "Circle", icon: Users },
  { to: "/assistant", label: "Assistant", icon: Sparkles },
] as const;

function RailLink({
  to,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof Pill;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      title={label}
      className={cn(
        "group/link relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-[250ms]",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft font-semibold"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="overflow-hidden whitespace-nowrap opacity-0 transition-all duration-[250ms] group-hover:opacity-100">
        {label}
      </span>
    </Link>
  );
}

function RailBody({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = (to: string) => pathname.startsWith(to);
  const { data: user } = useQuery({
    queryKey: ["/user/profile"],
    queryFn: () => fetcher("/user/profile"),
  });

  return (
    <div className="flex h-full flex-col gap-1 p-3">
      {/* Brand Header */}
      <div className="flex items-center gap-2 px-1 py-1.5">
        <Link to="/" aria-label="DoseLoop home" className="shrink-0">
          <Logo showWordmark={false} size="sm" />
        </Link>
        <span className="font-display font-bold text-sm tracking-tight text-sidebar-foreground opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100">
          DoseLoop
        </span>
      </div>

      {/* Primary Nav */}
      <nav className="mt-3 flex flex-col gap-1" aria-label="Primary">
        {nav.map((item) => (
          <RailLink key={item.to} {...item} active={isActive(item.to)} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="my-2.5 h-px bg-sidebar-border/60" />

      {/* Secondary Nav */}
      <nav className="flex flex-col gap-1" aria-label="Secondary">
        {secondaryNav.map((item) => (
          <RailLink key={item.to} {...item} active={isActive(item.to)} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* Bottom Hub: Theme Toggle, SOS, Profile */}
      <div className="mt-auto space-y-1.5 pt-2">
        {/* Visible Theme Toggle */}
        <div className="flex items-center gap-2 rounded-2xl p-1 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
          <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-accent" />
          <span className="overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100">
            Switch Mode
          </span>
        </div>

        {/* Emergency SOS button */}
        <Link
          to="/emergency"
          onClick={onNavigate}
          title="Emergency"
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/15 px-3 py-2 text-xs font-bold text-destructive-foreground transition-colors duration-[250ms] hover:bg-destructive/25",
          )}
        >
          <LifeBuoy className="size-4 shrink-0" aria-hidden="true" />
          <span className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100">
            Emergency SOS
          </span>
        </Link>

        {/* User Profile */}
        <Link
          to="/profile"
          onClick={onNavigate}
          title={user ? `${user.firstName} ${user.lastName}` : "Profile"}
          className="flex items-center gap-3 rounded-2xl bg-sidebar-accent/50 px-2 py-2 transition-colors duration-[250ms] hover:bg-sidebar-accent"
        >
          <Avatar className="size-8 shrink-0 border border-sidebar-border">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
              {user ? `${user.firstName?.charAt(0) || "A"}${user.lastName?.charAt(0) || "K"}` : "AK"}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 overflow-hidden opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100">
            <span className="block truncate text-xs font-semibold text-sidebar-foreground">
              {user ? `${user.firstName} ${user.lastName}` : "Aarav Kumar"}
            </span>
            <span className="block truncate text-[10px] text-sidebar-foreground/60">Personal Care</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-200">
      {/* Desktop floating rail — 68px icon rail, expands smoothly on hover */}
      <aside className="group fixed inset-y-3 left-3 z-30 hidden w-[68px] overflow-hidden rounded-3xl border border-sidebar-border bg-sidebar shadow-float backdrop-blur-xl transition-[width] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:w-60 lg:block">
        <RailBody pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <header className="glass sticky top-0 z-20 flex items-center justify-between border-b border-border/80 px-4 py-2.5 lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open navigation menu"
            onClick={() => setOpen(true)}
            className="text-foreground"
          >
            <Menu className="size-5" />
          </Button>
          <Link to="/" aria-label="DoseLoop home">
            <Logo size="sm" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/emergency"
            className="flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
          >
            <LifeBuoy className="size-3.5" />
            <span>SOS</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile drawer (full nav) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 border-r border-sidebar-border bg-sidebar p-4 shadow-float animate-rise">
            <div className="flex items-center justify-between pb-3 border-b border-sidebar-border/60">
              <Logo size="sm" />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="text-sidebar-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>
            <nav className="mt-4 flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname.startsWith(item.to)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent",
                  )}
                >
                  <item.icon className="size-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="my-4 h-px bg-sidebar-border/60" />
            <nav className="flex flex-col gap-1">
              {secondaryNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2 text-xs font-medium transition-colors",
                    pathname.startsWith(item.to)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent",
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6 flex items-center justify-between border-t border-sidebar-border/60">
              <ThemeToggle className="text-sidebar-foreground" />
              <Link
                to="/emergency"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/20 px-3 py-1 text-xs font-bold text-destructive"
              >
                <LifeBuoy className="size-3.5" />
                <span>Emergency SOS</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-[84px]">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile floating bottom nav with central Quick Action */}
      <div className="fixed inset-x-0 bottom-3 z-30 flex justify-center px-4 lg:hidden">
        <nav
          className="glass relative flex w-full max-w-md items-center justify-between rounded-full border border-border/80 px-3 py-1.5 shadow-float"
          aria-label="Mobile"
        >
          {mobileNav.slice(0, 2).map((item) => (
            <MobileTab key={item.to} {...item} active={pathname.startsWith(item.to)} />
          ))}

          <Link
            to="/dashboard"
            aria-label="Quick log"
            className="grid size-12 shrink-0 -translate-y-4 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform active:scale-95"
          >
            <Plus className="size-5" />
          </Link>

          {mobileNav.slice(2).map((item) => (
            <MobileTab key={item.to} {...item} active={pathname.startsWith(item.to)} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function MobileTab({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Pill;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1 text-[11px] font-medium transition-colors",
        active ? "text-primary font-bold" : "text-muted-foreground",
      )}
    >
      <Icon className="size-4.5" aria-hidden="true" />
      {label}
    </Link>
  );
}
