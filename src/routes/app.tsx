import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard, MessageSquare, Sparkles, Bot, Inbox, BarChart3,
  Settings, Plug, GraduationCap, Zap, CreditCard, Users, HelpCircle, Bell, Search, LogOut, Menu, X, Tags,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { email: data.session.user.email ?? "" };
  },
  component: AppLayout,
});

const navMain = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/chats", icon: Inbox, label: "Chats" },
  { to: "/app/crm", icon: Users, label: "CRM" },
  { to: "/app/smart-tags", icon: Tags, label: "Smart Tags" },
  { to: "/app/metrics", icon: BarChart3, label: "Métricas" },
  { to: "/app/create", icon: Sparkles, label: "Crear agente" },
  { to: "/app/simulator", icon: MessageSquare, label: "Simulador" },
  { to: "/app/integrations", icon: Plug, label: "Integraciones" },
  { to: "/app/billing", icon: CreditCard, label: "Facturación" },
  { to: "/app/settings", icon: Settings, label: "Configuración" },
];

const navSoon = [
  { icon: Inbox, label: "Bandeja" },
  { icon: GraduationCap, label: "Entrenamiento" },
  { icon: Zap, label: "Automatizaciones" },
  { icon: Users, label: "Equipo" },
];



function AppLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { email } = Route.useRouteContext();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Cerrar el menú mobile al navegar
  useEffect(() => {
    setMobileNavOpen(false);
  }, [path]);

  const handleLogout = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate({ to: "/login" });
  };

  const sidebarContent = (
    <>
      <Link to="/" className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow animate-glow-pulse">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-bold tracking-tight">clerivo</span>
      </Link>

      <nav className="scrollbar-hide flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Principal</p>
        <ul className="space-y-1">
          {navMain.map(item => {
            const active = path === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-glow scale-[1.02]"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5"
                  }`}
                >
                  {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-x-3 -translate-y-1/2 rounded-full bg-primary" />}
                  <item.icon className={`h-4 w-4 transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Workspace</p>
        <ul className="space-y-1">
          {navSoon.map(item => (
            <li key={item.label}>
              <button
                className="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent"
                title="Próximamente"
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] uppercase text-muted-foreground">soon</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="m-3 rounded-xl border border-border bg-surface-elevated p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium">Plan Pro</span>
          <span className="text-muted-foreground">42%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[42%] rounded-full bg-gradient-primary" />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">4.250 / 10.000 mensajes este mes</p>
        <button className="mt-3 w-full rounded-lg bg-foreground/5 px-3 py-1.5 text-xs font-medium hover:bg-foreground/10">
          Mejorar plan
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-surface">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-sidebar md:flex">
        {sidebarContent}
      </aside>

      {/* Sidebar mobile (drawer) */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85%] flex-col border-r border-border bg-sidebar shadow-xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2 md:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-display text-base font-bold tracking-tight">clerivo</span>
            </Link>
            <div className="relative hidden max-w-md flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar conversaciones, leads, agentes…"
                className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:bg-background"
              />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <button className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground sm:flex">
              <HelpCircle className="h-4 w-4" />
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>
            <div className="ml-1 flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                {(email[0] || "U").toUpperCase()}
              </div>
              <div className="hidden text-xs lg:block">
                <p className="max-w-[140px] truncate font-semibold leading-tight">{email || "Usuario"}</p>
                <p className="text-muted-foreground">Mi cuenta</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={signingOut}
                title="Cerrar sesión"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 animate-fade-in pb-20 md:pb-0" key={path}>
          <Outlet />
        </main>

        {/* Bottom nav mobile */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-border bg-background/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
          aria-label="Navegación inferior"
        >
          {[
            { to: "/app/dashboard", icon: LayoutDashboard, label: "Inicio" },
            { to: "/app/chats", icon: Inbox, label: "Chats" },
            { to: "/app/create", icon: Sparkles, label: "Crear" },
            { to: "/app/metrics", icon: BarChart3, label: "Métricas" },
            { to: "/app/settings", icon: Settings, label: "Ajustes" },
          ].map((item) => {
            const active = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`flex h-8 w-12 items-center justify-center rounded-full transition ${
                    active ? "bg-primary/10" : ""
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
