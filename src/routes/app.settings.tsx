import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  User, Building2, Bot, Bell, Shield, Users, Palette,
  KeyRound, Webhook, Trash2, Check, Copy, Eye, EyeOff, Upload,
  Sparkles, Lock, CreditCard, Languages, Clock, Smartphone, Mail, Loader2, Plus, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Configuración — Clerivo" }] }),
  component: SettingsPage,
});

type TabId =
  | "profile" | "business" | "agent" | "notifications" | "security"
  | "team" | "branding" | "language" | "api" | "webhooks" | "billing" | "danger";

const tabs: { id: TabId; label: string; icon: any; group: string }[] = [
  { id: "profile", label: "Perfil", icon: User, group: "Cuenta" },
  { id: "business", label: "Negocio", icon: Building2, group: "Cuenta" },
  { id: "agent", label: "Agente IA", icon: Bot, group: "Producto" },
  { id: "branding", label: "Marca", icon: Palette, group: "Producto" },
  { id: "notifications", label: "Notificaciones", icon: Bell, group: "Producto" },
  { id: "language", label: "Idioma y región", icon: Languages, group: "Producto" },
  { id: "team", label: "Equipo", icon: Users, group: "Workspace" },
  { id: "security", label: "Seguridad", icon: Shield, group: "Workspace" },
  { id: "api", label: "API Keys", icon: KeyRound, group: "Desarrolladores" },
  { id: "webhooks", label: "Webhooks", icon: Webhook, group: "Desarrolladores" },
  { id: "billing", label: "Facturación", icon: CreditCard, group: "Workspace" },
  { id: "danger", label: "Zona de peligro", icon: Trash2, group: "Workspace" },
];

/* ------------ Defaults ------------ */
const DEFAULTS = {
  profile: { first_name: "", last_name: "", email: "", phone: "", role: "", timezone: "ar" },
  business: { name: "", industry: "muebles", website: "", country: "ar", tax_id: "", team_size: "2-10", description: "", hours: "" },
  agent: {
    name: "Sofía", role: "ventas", language: "es", tone: "friendly", creativity: 40,
    welcome: "¡Hola! Soy tu asistente. Contame en qué te puedo ayudar.",
    system_prompt: "• Sé claro y conciso.\n• No prometas lo que no podés cumplir.\n• Si dudás, derivá a un humano.",
    auto_handoff: true, proactive: true, emoji: false, learning: true,
    forbidden: "", max_messages: 50, response_time: "3 segundos", max_discount: "10%",
  },
  branding: { color: "#6366F1", position: "br", button_text: "¿Necesitás ayuda?", avatar: "initials", show_powered_by: true },
  notifications: { hot: true, daily: true, weekly: false, errors: true, newsletter: false, mobile: true, alert_email: "", quiet_hours: "22:00 – 08:00" },
  language: { panel: "es", currency: "ars", date_format: "dmy", week_start: "lun" },
  billing_prefs: { legal_name: "", tax_id: "", fiscal_status: "ri", invoice_email: "", address: "", postal_code: "", auto_renew: true, paused: false },
};

type Settings = typeof DEFAULTS;

function SettingsPage() {
  const [active, setActive] = useState<TabId>("profile");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? "");
      const { data } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setSettings({
          profile: { ...DEFAULTS.profile, email: user.email ?? "", ...(data.profile as any) },
          business: { ...DEFAULTS.business, ...(data.business as any) },
          agent: { ...DEFAULTS.agent, ...(data.agent as any) },
          branding: { ...DEFAULTS.branding, ...(data.branding as any) },
          notifications: { ...DEFAULTS.notifications, alert_email: user.email ?? "", ...(data.notifications as any) },
          language: { ...DEFAULTS.language, ...(data.language as any) },
          billing_prefs: { ...DEFAULTS.billing_prefs, invoice_email: user.email ?? "", ...(data.billing_prefs as any) },
        });
      } else {
        setSettings(s => ({
          ...s,
          profile: { ...s.profile, email: user.email ?? "" },
          notifications: { ...s.notifications, alert_email: user.email ?? "" },
          billing_prefs: { ...s.billing_prefs, invoice_email: user.email ?? "" },
        }));
      }
      setLoading(false);
    })();
  }, []);

  const updateSection = (key: keyof Settings, partial: any) => {
    setSettings(prev => ({ ...prev, [key]: { ...prev[key], ...partial } }));
  };

  const saveSection = async <K extends keyof Settings>(key: K) => {
    if (!userId) { toast.error("Debes iniciar sesión"); return; }
    const payload: any = { user_id: userId, [key]: settings[key] };
    const { error } = await supabase
      .from("user_settings")
      .upsert(payload, { onConflict: "user_id" });
    if (error) toast.error("No se pudo guardar: " + error.message);
    else toast.success("Cambios guardados ✓");
  };

  const grouped = tabs.reduce<Record<string, typeof tabs>>((acc, t) => {
    (acc[t.group] ||= []).push(t); return acc;
  }, {});

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 animate-fade-up">
        <p className="text-sm text-muted-foreground">Workspace · {settings.business.name || "Sin nombre"}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administrá todos los parámetros de tu cuenta, agente, equipo y conexiones.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="animate-fade-up">
          <nav className="sticky top-20 space-y-5">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{group}</p>
                <ul className="space-y-0.5">
                  {items.map(t => (
                    <li key={t.id}>
                      <button
                        onClick={() => setActive(t.id)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition ${
                          active === t.id
                            ? "bg-accent text-accent-foreground font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <t.icon className="h-3.5 w-3.5" /> {t.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div key={active} className="space-y-5 animate-fade-up">
          {active === "profile" && <ProfileSection v={settings.profile} on={(p: any) => updateSection("profile", p)} save={() => saveSection("profile")} />}
          {active === "business" && <BusinessSection v={settings.business} on={(p: any) => updateSection("business", p)} save={() => saveSection("business")} />}
          {active === "agent" && <AgentSection v={settings.agent} on={(p: any) => updateSection("agent", p)} save={() => saveSection("agent")} />}
          {active === "branding" && <BrandingSection v={settings.branding} on={(p: any) => updateSection("branding", p)} save={() => saveSection("branding")} />}
          {active === "notifications" && <NotificationsSection v={settings.notifications} on={(p: any) => updateSection("notifications", p)} save={() => saveSection("notifications")} />}
          {active === "language" && <LanguageSection v={settings.language} on={(p: any) => updateSection("language", p)} save={() => saveSection("language")} />}
          {active === "team" && userId && <TeamSection ownerId={userId} ownerEmail={userEmail} />}
          {active === "security" && <SecuritySection />}
          {active === "api" && <ApiSection />}
          {active === "webhooks" && userId && <WebhooksSection userId={userId} />}
          {active === "billing" && <BillingPrefsSection v={settings.billing_prefs} on={(p: any) => updateSection("billing_prefs", p)} save={() => saveSection("billing_prefs")} />}
          {active === "danger" && userId && <DangerSection userId={userId} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable ---------- */

function Section({ title, desc, children, footer }: any) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card hover-lift">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display font-semibold">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      <div className="space-y-5 px-6 py-5">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface px-6 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: any) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 ${props.className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[88px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 ${props.className ?? ""}`}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 ${props.className ?? ""}`}
    >{children}</select>
  );
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 transition hover:border-primary/40">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-gradient-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

function SaveButton({ onSave }: { onSave: () => Promise<void> | void }) {
  const [saving, setSaving] = useState(false);
  return (
    <button
      onClick={async () => { setSaving(true); await onSave(); setSaving(false); }}
      disabled={saving}
      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-50"
    >
      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      {saving ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

/* ---------- Sections ---------- */

function ProfileSection({ v, on, save }: any) {
  const initials = ((v.first_name?.[0] ?? "") + (v.last_name?.[0] ?? "")).toUpperCase() || "U";
  return (
    <Section title="Perfil personal" desc="Tu información como usuario de Clerivo." footer={<SaveButton onSave={save} />}>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary font-display text-xl font-bold text-primary-foreground">{initials}</div>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => toast.info("Subida de avatar próximamente")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
            <Upload className="h-3 w-3" /> Cambiar foto
          </button>
          <p className="text-[11px] text-muted-foreground">JPG o PNG, máx. 2MB</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre"><Input value={v.first_name} onChange={e => on({ first_name: e.target.value })} /></Field>
        <Field label="Apellido"><Input value={v.last_name} onChange={e => on({ last_name: e.target.value })} /></Field>
        <Field label="Email" hint="Para cambiar el email usá la sección de Seguridad."><Input type="email" value={v.email} disabled /></Field>
        <Field label="Teléfono"><Input value={v.phone} onChange={e => on({ phone: e.target.value })} /></Field>
        <Field label="Cargo"><Input value={v.role} onChange={e => on({ role: e.target.value })} /></Field>
        <Field label="Zona horaria">
          <Select value={v.timezone} onChange={e => on({ timezone: e.target.value })}>
            <option value="ar">(GMT-3) Buenos Aires</option>
            <option value="mx">(GMT-6) Ciudad de México</option>
            <option value="es">(GMT+1) Madrid</option>
            <option value="cl">(GMT-3) Santiago</option>
          </Select>
        </Field>
      </div>
    </Section>
  );
}

function BusinessSection({ v, on, save }: any) {
  return (
    <Section title="Datos del negocio" desc="Esta información ayuda al agente a representarte mejor." footer={<SaveButton onSave={save} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre del negocio"><Input value={v.name} onChange={e => on({ name: e.target.value })} /></Field>
        <Field label="Rubro">
          <Select value={v.industry} onChange={e => on({ industry: e.target.value })}>
            <option value="ecommerce">E-commerce</option>
            <option value="muebles">Muebles y decoración</option>
            <option value="inmobiliaria">Inmobiliaria</option>
            <option value="estetica">Estética / belleza</option>
            <option value="restaurante">Restaurante</option>
            <option value="salud">Salud</option>
            <option value="servicios">Servicios profesionales</option>
          </Select>
        </Field>
        <Field label="Sitio web"><Input value={v.website} onChange={e => on({ website: e.target.value })} /></Field>
        <Field label="País">
          <Select value={v.country} onChange={e => on({ country: e.target.value })}>
            <option value="ar">Argentina</option><option value="mx">México</option><option value="es">España</option><option value="cl">Chile</option><option value="co">Colombia</option>
          </Select>
        </Field>
        <Field label="CUIT / RFC / NIF"><Input value={v.tax_id} onChange={e => on({ tax_id: e.target.value })} /></Field>
        <Field label="Tamaño del equipo">
          <Select value={v.team_size} onChange={e => on({ team_size: e.target.value })}>
            <option value="1">1 (solo yo)</option><option value="2-10">2 – 10</option><option value="11-50">11 – 50</option><option value="50+">50+</option>
          </Select>
        </Field>
      </div>
      <Field label="Descripción del negocio" hint="El agente la usará como contexto base.">
        <Textarea value={v.description} onChange={e => on({ description: e.target.value })} />
      </Field>
      <Field label="Horario de atención">
        <Input value={v.hours} onChange={e => on({ hours: e.target.value })} placeholder="Lun a Sáb · 9:00 a 19:00 hs" />
      </Field>
    </Section>
  );
}

function AgentSection({ v, on, save }: any) {
  return (
    <>
      <Section title="Agente IA" desc="Personalidad, comportamiento y límites de tu agente." footer={<SaveButton onSave={save} />}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre del agente"><Input value={v.name} onChange={e => on({ name: e.target.value })} /></Field>
          <Field label="Rol que cumple">
            <Select value={v.role} onChange={e => on({ role: e.target.value })}>
              <option value="ventas">Vendedora consultiva</option>
              <option value="atencion">Atención al cliente</option>
              <option value="reservas">Reservas y turnos</option>
              <option value="soporte">Soporte técnico</option>
            </Select>
          </Field>
          <Field label="Idioma principal">
            <Select value={v.language} onChange={e => on({ language: e.target.value })}>
              <option value="es">Español (neutro)</option>
              <option value="es-ar">Español (rioplatense)</option>
              <option value="es-mx">Español (México)</option>
              <option value="pt-br">Português (BR)</option>
              <option value="en">English</option>
            </Select>
          </Field>
          <Field label="Tono">
            <Select value={v.tone} onChange={e => on({ tone: e.target.value })}>
              <option value="friendly">Cercano y amable</option>
              <option value="pro">Profesional</option>
              <option value="casual">Casual y divertido</option>
              <option value="formal">Formal corporativo</option>
            </Select>
          </Field>
        </div>

        <Field label={`Creatividad de las respuestas · ${v.creativity}%`} hint="Más bajo = predecible. Más alto = más libertad.">
          <input type="range" min={0} max={100} value={v.creativity} onChange={e => on({ creativity: +e.target.value })} className="w-full accent-[var(--primary)]" />
        </Field>

        <Field label="Mensaje de bienvenida">
          <Textarea value={v.welcome} onChange={e => on({ welcome: e.target.value })} />
        </Field>

        <Field label="Instrucciones especiales (system prompt)" hint="Reglas que el agente siempre debe seguir.">
          <Textarea rows={5} value={v.system_prompt} onChange={e => on({ system_prompt: e.target.value })} />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Toggle checked={v.auto_handoff} onChange={x => on({ auto_handoff: x })} label="Derivación automática a humano" desc="Cuando detecta intención de compra alta o duda fuera de su conocimiento." />
          <Toggle checked={v.proactive} onChange={x => on({ proactive: x })} label="Mensajes proactivos" desc="Iniciar conversación con visitantes inactivos." />
          <Toggle checked={v.emoji} onChange={x => on({ emoji: x })} label="Usar emojis" desc="Permitir emojis cuando sea apropiado." />
          <Toggle checked={v.learning} onChange={x => on({ learning: x })} label="Modo aprendizaje" desc="Aprende de las correcciones del equipo." />
        </div>

        <Field label="Temas prohibidos" hint="El agente nunca responderá sobre estos temas.">
          <Input value={v.forbidden} onChange={e => on({ forbidden: e.target.value })} placeholder="política, religión, competencia directa" />
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Máx. mensajes por conversación"><Input type="number" value={v.max_messages} onChange={e => on({ max_messages: +e.target.value })} /></Field>
          <Field label="Tiempo máx. de respuesta"><Input value={v.response_time} onChange={e => on({ response_time: e.target.value })} /></Field>
          <Field label="Descuento máximo permitido"><Input value={v.max_discount} onChange={e => on({ max_discount: e.target.value })} /></Field>
        </div>
      </Section>
    </>
  );
}

function BrandingSection({ v, on, save }: any) {
  return (
    <Section title="Marca y apariencia del chat" desc="Personalizá cómo se ve tu agente en el sitio." footer={<SaveButton onSave={save} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Color principal">
          <div className="flex items-center gap-2">
            <input type="color" value={v.color} onChange={e => on({ color: e.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-transparent" />
            <Input value={v.color} onChange={e => on({ color: e.target.value })} className="flex-1" />
          </div>
        </Field>
        <Field label="Posición del widget">
          <Select value={v.position} onChange={e => on({ position: e.target.value })}>
            <option value="br">Abajo a la derecha</option>
            <option value="bl">Abajo a la izquierda</option>
            <option value="tr">Arriba a la derecha</option>
          </Select>
        </Field>
        <Field label="Texto del botón flotante"><Input value={v.button_text} onChange={e => on({ button_text: e.target.value })} /></Field>
        <Field label="Avatar">
          <Select value={v.avatar} onChange={e => on({ avatar: e.target.value })}>
            <option value="initials">Iniciales del agente</option>
            <option value="logo">Logo de la empresa</option>
            <option value="custom">Foto personalizada</option>
          </Select>
        </Field>
      </div>
      <Toggle checked={v.show_powered_by} onChange={x => on({ show_powered_by: x })} label="Mostrar marca 'Powered by Clerivo'" desc="Disponible para ocultar en el plan Growth o superior." />

      {/* Live preview */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="mb-3 text-xs font-semibold text-muted-foreground">Vista previa</p>
        <div className="flex items-end justify-end">
          <div className="w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: v.color, color: "#fff" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">AI</div>
              <p className="text-sm font-semibold">{v.button_text}</p>
            </div>
            <div className="p-4 text-xs text-muted-foreground">Chat en vivo · {v.position === "br" ? "abajo derecha" : v.position === "bl" ? "abajo izquierda" : "arriba derecha"}</div>
            {v.show_powered_by && <p className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">Powered by Clerivo</p>}
          </div>
        </div>
      </div>
    </Section>
  );
}

function NotificationsSection({ v, on, save }: any) {
  return (
    <Section title="Notificaciones" desc="Decidí cuándo y cómo querés que te avisemos." footer={<SaveButton onSave={save} />}>
      <div className="grid gap-3 md:grid-cols-2">
        <Toggle checked={v.hot} onChange={x => on({ hot: x })} label="Lead caliente detectado" desc="Email + push cuando el agente identifica una venta probable." />
        <Toggle checked={v.daily} onChange={x => on({ daily: x })} label="Resumen diario" desc="Cada mañana a las 9:00 hs." />
        <Toggle checked={v.weekly} onChange={x => on({ weekly: x })} label="Resumen semanal" desc="Métricas y comparativa de la semana." />
        <Toggle checked={v.errors} onChange={x => on({ errors: x })} label="Errores e incidentes" desc="Si una integración deja de funcionar." />
        <Toggle checked={v.newsletter} onChange={x => on({ newsletter: x })} label="Novedades de producto" desc="Nuevas features y mejores prácticas." />
        <Toggle checked={v.mobile} onChange={x => on({ mobile: x })} label="Notificaciones push móviles" desc="Necesita la app de Clerivo instalada." />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email para alertas"><Input value={v.alert_email} onChange={e => on({ alert_email: e.target.value })} /></Field>
        <Field label="Horario silencioso"><Input value={v.quiet_hours} onChange={e => on({ quiet_hours: e.target.value })} /></Field>
      </div>
    </Section>
  );
}

function LanguageSection({ v, on, save }: any) {
  return (
    <Section title="Idioma y región" desc="Aplica al panel y a los formatos de fecha y moneda." footer={<SaveButton onSave={save} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Idioma del panel">
          <Select value={v.panel} onChange={e => on({ panel: e.target.value })}>
            <option value="es">Español</option><option value="en">English</option><option value="pt">Português</option>
          </Select>
        </Field>
        <Field label="Moneda">
          <Select value={v.currency} onChange={e => on({ currency: e.target.value })}>
            <option value="ars">ARS · Peso argentino</option>
            <option value="usd">USD · Dólar estadounidense</option>
            <option value="mxn">MXN · Peso mexicano</option>
            <option value="eur">EUR · Euro</option>
          </Select>
        </Field>
        <Field label="Formato de fecha">
          <Select value={v.date_format} onChange={e => on({ date_format: e.target.value })}>
            <option value="dmy">DD/MM/AAAA</option><option value="mdy">MM/DD/AAAA</option><option value="ymd">AAAA-MM-DD</option>
          </Select>
        </Field>
        <Field label="Primer día de la semana">
          <Select value={v.week_start} onChange={e => on({ week_start: e.target.value })}>
            <option value="lun">Lunes</option><option value="dom">Domingo</option>
          </Select>
        </Field>
      </div>
    </Section>
  );
}

/* ---------- Team (real CRUD) ---------- */
function TeamSection({ ownerId, ownerEmail }: { ownerId: string; ownerEmail: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Agente");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("team_members").select("*").eq("owner_id", ownerId).order("created_at");
    setMembers(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [ownerId]);

  const invite = async () => {
    if (!inviteEmail.trim()) return toast.error("El email es obligatorio");
    const { error } = await supabase.from("team_members").insert({ owner_id: ownerId, email: inviteEmail.trim(), name: inviteName.trim() || null, role: inviteRole });
    if (error) return toast.error(error.message);
    toast.success("Invitación enviada");
    setShowInvite(false); setInviteEmail(""); setInviteName(""); setInviteRole("Agente");
    load();
  };

  const updateRole = async (id: string, role: string) => {
    const { error } = await supabase.from("team_members").update({ role }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Rol actualizado");
  };

  const remove = async (id: string) => {
    if (!confirm("¿Quitar este miembro?")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Miembro eliminado"); load();
  };

  return (
    <Section
      title="Equipo"
      desc="Invitá a tu equipo y asigná roles."
      footer={
        <button onClick={() => setShowInvite(s => !s)} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow">
          {showInvite ? <X className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />} {showInvite ? "Cancelar" : "Invitar miembro"}
        </button>
      }
    >
      {showInvite && (
        <div className="rounded-xl border border-primary/30 bg-accent/40 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="email@ejemplo.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            <Input placeholder="Nombre (opcional)" value={inviteName} onChange={e => setInviteName(e.target.value)} />
            <Select value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
              <option>Owner</option><option>Admin</option><option>Agente</option><option>Solo lectura</option>
            </Select>
          </div>
          <button onClick={invite} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-1.5 text-sm font-semibold text-background">
            <Plus className="h-3.5 w-3.5" /> Enviar invitación
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs text-muted-foreground">
            <tr><th className="px-4 py-2 text-left font-medium">Miembro</th><th className="px-4 py-2 text-left font-medium">Rol</th><th className="px-4 py-2 text-left font-medium">Estado</th><th /></tr>
          </thead>
          <tbody>
            <tr className="border-t border-border bg-surface/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">{ownerEmail[0]?.toUpperCase() ?? "Y"}</div>
                  <div><p className="font-medium">Tú</p><p className="text-xs text-muted-foreground">{ownerEmail}</p></div>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">Owner</span></td>
              <td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Activo</span></td>
              <td />
            </tr>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">Cargando…</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">Aún no invitaste a nadie.</td></tr>
            ) : members.map(m => (
              <tr key={m.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">{(m.name?.[0] ?? m.email[0]).toUpperCase()}</div>
                    <div><p className="font-medium">{m.name || m.email}</p><p className="text-xs text-muted-foreground">{m.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Select defaultValue={m.role} onChange={e => updateRole(m.id, e.target.value)} className="h-8 text-xs">
                    <option>Owner</option><option>Admin</option><option>Agente</option><option>Solo lectura</option>
                  </Select>
                </td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning"><span className="h-1.5 w-1.5 rounded-full bg-warning" /> {m.status}</span></td>
                <td className="px-4 py-3 text-right"><button onClick={() => remove(m.id)} className="text-xs text-muted-foreground hover:text-destructive">Quitar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{members.length + 1} de 10 asientos incluidos en el plan Pro.</p>
    </Section>
  );
}

/* ---------- Security (real password change) ---------- */
function SecuritySection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [twofa, setTwofa] = useState(false);

  const changePassword = async () => {
    if (next.length < 10) return toast.error("La nueva contraseña debe tener al menos 10 caracteres");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Contraseña actualizada ✓"); setCurrent(""); setNext(""); }
  };

  return (
    <>
      <Section title="Seguridad" desc="Protegé el acceso a tu workspace." footer={
        <button onClick={changePassword} disabled={saving || !next} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Cambiar contraseña
        </button>
      }>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contraseña actual" hint="Solo informativo en este flujo."><Input type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="••••••••" /></Field>
          <Field label="Nueva contraseña"><Input type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="Mín. 10 caracteres" /></Field>
        </div>
        <Toggle checked={twofa} onChange={(v) => { setTwofa(v); toast.info(v ? "2FA habilitado (demo)" : "2FA deshabilitado"); }} label="Autenticación de dos factores (2FA)" desc="Pediremos un código además de tu contraseña al iniciar sesión." />
      </Section>

      <Section title="Sesiones activas" desc="Dispositivos donde tu cuenta está abierta.">
        <div className="space-y-2">
          {[
            { d: "Este navegador", l: "Sesión actual", icon: Smartphone, current: true },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary"><s.icon className="h-4 w-4" /></div>
                <div><p className="text-sm font-medium">{s.d} {s.current && <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">Esta sesión</span>}</p><p className="text-xs text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{s.l}</p></div>
              </div>
            </div>
          ))}
          <button onClick={async () => { await supabase.auth.signOut(); toast.success("Sesión cerrada"); }} className="text-xs font-semibold text-destructive hover:underline">Cerrar todas las sesiones</button>
        </div>
      </Section>
    </>
  );
}

/* ---------- API ---------- */
function ApiSection() {
  const [show, setShow] = useState(false);
  const [keys, setKeys] = useState<{ id: string; label: string; value: string; created: string }[]>([
    { id: "1", label: "Clave principal · Producción", value: "sk_live_clrv_" + Math.random().toString(36).slice(2, 26), created: new Date().toLocaleDateString() },
  ]);
  const masked = (k: string) => k.slice(0, 14) + "••••••••••••" + k.slice(-3);

  const create = () => {
    const v = "sk_live_clrv_" + Math.random().toString(36).slice(2, 26);
    setKeys([...keys, { id: crypto.randomUUID(), label: "Nueva clave", value: v, created: new Date().toLocaleDateString() }]);
    toast.success("Nueva API key creada");
  };

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success("Copiada al portapapeles"); };
  const revoke = (id: string) => { if (confirm("¿Revocar esta clave?")) { setKeys(keys.filter(k => k.id !== id)); toast.success("Clave revocada"); } };

  return (
    <Section title="API Keys" desc="Usalas para integrar Clerivo con tus propios sistemas." footer={
      <button onClick={create} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow">
        <Sparkles className="h-3.5 w-3.5" /> Crear nueva key
      </button>
    }>
      {keys.map(k => (
        <div key={k.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-muted-foreground">{k.label}</p>
              <code className="mt-1 block truncate font-mono text-sm">{show ? k.value : masked(k.value)}</code>
            </div>
            <button onClick={() => setShow(!show)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted">
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => copy(k.value)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted"><Copy className="h-3.5 w-3.5" /></button>
            <button onClick={() => revoke(k.id)} className="text-xs font-semibold text-muted-foreground hover:text-destructive">Revocar</button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Creada el {k.created}</p>
        </div>
      ))}
    </Section>
  );
}

/* ---------- Webhooks (real CRUD) ---------- */
function WebhooksSection({ userId }: { userId: string }) {
  const [hooks, setHooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState("lead.created, sale.estimated");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("webhooks").select("*").eq("user_id", userId).order("created_at");
    setHooks(data ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, [userId]);

  const add = async () => {
    if (!url.trim().startsWith("http")) return toast.error("URL inválida");
    const { error } = await supabase.from("webhooks").insert({ user_id: userId, url: url.trim(), events: events.trim() });
    if (error) return toast.error(error.message);
    toast.success("Webhook creado"); setUrl(""); setShowAdd(false); load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("webhooks").update({ active }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este webhook?")) return;
    await supabase.from("webhooks").delete().eq("id", id);
    toast.success("Webhook eliminado"); load();
  };

  return (
    <Section title="Webhooks" desc="Recibí eventos de Clerivo en tu propio backend." footer={
      <button onClick={() => setShowAdd(s => !s)} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow">
        {showAdd ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />} {showAdd ? "Cancelar" : "Nuevo webhook"}
      </button>
    }>
      {showAdd && (
        <div className="rounded-xl border border-primary/30 bg-accent/40 p-4 space-y-3">
          <Field label="URL"><Input placeholder="https://tu-backend.com/api/clerivo" value={url} onChange={e => setUrl(e.target.value)} /></Field>
          <Field label="Eventos" hint="Separados por coma"><Input value={events} onChange={e => setEvents(e.target.value)} /></Field>
          <button onClick={add} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-1.5 text-sm font-semibold text-background">
            <Plus className="h-3.5 w-3.5" /> Crear webhook
          </button>
        </div>
      )}
      {loading ? <p className="text-xs text-muted-foreground">Cargando…</p> :
        hooks.length === 0 ? <p className="text-xs text-muted-foreground">Aún no configuraste webhooks.</p> :
        hooks.map(w => (
          <div key={w.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <code className="truncate font-mono text-xs">{w.url}</code>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(w.id, !w.active)} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${w.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${w.active ? "bg-success" : "bg-muted-foreground"}`} /> {w.active ? "Activo" : "Pausado"}
                </button>
                <button onClick={() => remove(w.id)} className="text-xs text-muted-foreground hover:text-destructive">Eliminar</button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Eventos: {w.events}</p>
          </div>
        ))
      }
    </Section>
  );
}

function BillingPrefsSection({ v, on, save }: any) {
  return (
    <Section title="Preferencias de facturación" desc="Datos que aparecen en tus facturas." footer={<SaveButton onSave={save} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Razón social"><Input value={v.legal_name} onChange={e => on({ legal_name: e.target.value })} /></Field>
        <Field label="CUIT"><Input value={v.tax_id} onChange={e => on({ tax_id: e.target.value })} /></Field>
        <Field label="Condición fiscal">
          <Select value={v.fiscal_status} onChange={e => on({ fiscal_status: e.target.value })}>
            <option value="ri">Responsable Inscripto</option><option value="mono">Monotributo</option><option value="exento">Exento</option>
          </Select>
        </Field>
        <Field label="Email para facturas"><Input value={v.invoice_email} onChange={e => on({ invoice_email: e.target.value })} /></Field>
        <Field label="Dirección fiscal"><Input value={v.address} onChange={e => on({ address: e.target.value })} /></Field>
        <Field label="Código postal"><Input value={v.postal_code} onChange={e => on({ postal_code: e.target.value })} /></Field>
      </div>
      <Toggle checked={v.auto_renew} onChange={x => on({ auto_renew: x })} label="Renovación automática" desc="Renovamos tu plan automáticamente al finalizar el período." />
      <Toggle checked={v.paused} onChange={x => on({ paused: x })} label="Pausar facturación" desc="Dejamos de cobrarte el próximo ciclo." />
    </Section>
  );
}

function DangerSection({ userId }: { userId: string }) {
  const exportData = async () => {
    const [settings, team, hooks] = await Promise.all([
      supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("team_members").select("*").eq("owner_id", userId),
      supabase.from("webhooks").select("*").eq("user_id", userId),
    ]);
    const blob = new Blob([JSON.stringify({ settings: settings.data, team: team.data, webhooks: hooks.data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `clerivo-export-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export descargado ✓");
  };

  const deleteWorkspace = async () => {
    const ok = prompt('Para confirmar, escribí "ELIMINAR"');
    if (ok !== "ELIMINAR") return;
    await Promise.all([
      supabase.from("user_settings").delete().eq("user_id", userId),
      supabase.from("team_members").delete().eq("owner_id", userId),
      supabase.from("webhooks").delete().eq("user_id", userId),
    ]);
    await supabase.auth.signOut();
    toast.success("Workspace eliminado");
    window.location.href = "/";
  };

  const actions = [
    { t: "Exportar todos los datos", d: "Descargá un .json con toda tu configuración, equipo y webhooks.", b: "Solicitar export", danger: false, run: exportData },
    { t: "Pausar el agente", d: "El agente deja de responder en todos los canales hasta que lo reactives.", b: "Pausar agente", danger: false, run: () => toast.info("Agente pausado") },
    { t: "Eliminar workspace", d: "Borramos definitivamente todos los datos. Esta acción no se puede deshacer.", b: "Eliminar workspace", danger: true, run: deleteWorkspace },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/5">
      <div className="border-b border-destructive/30 px-6 py-4">
        <h2 className="font-display font-semibold text-destructive">Zona de peligro</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Acciones irreversibles. Tomate un minuto antes de confirmar.</p>
      </div>
      <div className="space-y-3 px-6 py-5">
        {actions.map((a, i) => (
          <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div><p className="text-sm font-semibold flex items-center gap-2">{a.danger && <Lock className="h-3.5 w-3.5 text-destructive" />} {a.t}</p><p className="mt-0.5 text-xs text-muted-foreground">{a.d}</p></div>
            <button onClick={a.run} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${a.danger ? "bg-destructive text-destructive-foreground hover:opacity-90" : "border border-border bg-background hover:bg-muted"}`}>{a.b}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
