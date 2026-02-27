import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  NkSpecialist, NkCert, STATUS_META, METHOD_LABELS, LEVEL_LABELS,
  getCertStatus, getSpecialistStatus,
} from "./nkStaffData";

interface Props {
  specialist: NkSpecialist;
  onClose: () => void;
  onEdit: () => void;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function CertCard({ cert }: { cert: NkCert }) {
  const cs = getCertStatus(cert.validUntil);
  const days = daysUntil(cert.validUntil);

  const colors = {
    valid:    { border: "border-green-200",  bg: "bg-green-50",  badge: "text-green-700 bg-green-100",  icon: "CheckCircle2",  iconCls: "text-green-600" },
    expiring: { border: "border-amber-200",  bg: "bg-amber-50",  badge: "text-amber-700 bg-amber-100",  icon: "Clock",         iconCls: "text-amber-600" },
    expired:  { border: "border-red-200",    bg: "bg-red-50",    badge: "text-red-700 bg-red-100",      icon: "AlertCircle",   iconCls: "text-red-600" },
  };
  const c = colors[cs];

  return (
    <div className={cn("rounded-lg border p-4 space-y-3", c.border, c.bg)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/80 border border-white/60 text-foreground">
              {cert.method}
            </span>
            <span className="text-xs font-medium text-foreground">{LEVEL_LABELS[cert.level]}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">{cert.certNumber}</div>
        </div>
        <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0", c.badge)}>
          <Icon name={c.icon} fallback="Info" size={11} className={c.iconCls} />
          {cs === "expired" ? "Просрочен" : cs === "expiring" ? `${days} дн.` : "Действует"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <span className="text-muted-foreground">Выдан:</span>
          <span className="text-foreground ml-1 font-medium">{cert.issuedAt}</span>
        </div>
        <div>
          <span className="text-muted-foreground">До:</span>
          <span className={cn("ml-1 font-medium", cs === "expired" ? "text-red-700" : cs === "expiring" ? "text-amber-700" : "text-foreground")}>
            {cert.validUntil}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Орган аттестации:</span>
          <span className="text-foreground ml-1">{cert.issuedBy}</span>
        </div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-1.5">Виды объектов допуска:</div>
        <div className="flex flex-wrap gap-1">
          {cert.objects.map(o => (
            <span key={o} className="px-1.5 py-0.5 rounded text-xs bg-white/70 border border-white/50 text-muted-foreground">{o}</span>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-1">{METHOD_LABELS[cert.method]}</div>
      </div>
    </div>
  );
}

export default function NkStaffDetail({ specialist: s, onClose, onEdit }: Props) {
  const status = getSpecialistStatus(s);
  const sm = STATUS_META[status];
  const expiredCount = s.certs.filter(c => getCertStatus(c.validUntil) === "expired").length;
  const expiringCount = s.certs.filter(c => getCertStatus(c.validUntil) === "expiring").length;
  const validCount = s.certs.filter(c => getCertStatus(c.validUntil) === "valid").length;
  const serviceYears = Math.floor((Date.now() - new Date(s.hiredAt).getTime()) / (365.25 * 86400000));

  const uniqueMethods = [...new Set(s.certs.map(c => c.method))];
  const maxLevel = s.certs.reduce((max, c) => {
    const order = { "I": 1, "II": 2, "III": 3 };
    return order[c.level] > order[max] ? c.level : max;
  }, "I" as "I" | "II" | "III");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl bg-background shadow-xl overflow-y-auto animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0", s.color)}>
                {s.photoInitials}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {s.lastName} {s.firstName} {s.patronymic}
                </div>
                <div className="text-xs text-muted-foreground">{s.position}</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0">
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className={cn("badge-status text-xs", sm.badgeClass)}>
              <Icon name={sm.icon} fallback="Info" size={11} />
              {sm.label}
            </span>
            <span className="text-xs text-muted-foreground">{s.department}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Стаж", value: `${serviceYears} лет`, sub: `с ${s.hiredAt.slice(0, 4)}` },
              { label: "Допуски", value: s.certs.length, sub: "удостоверений" },
              { label: "Методы НК", value: uniqueMethods.length, sub: uniqueMethods.slice(0, 2).join(", ") },
              { label: "Макс. уровень", value: maxLevel, sub: LEVEL_LABELS[maxLevel] },
            ].map((st, i) => (
              <div key={i} className="bg-white rounded-lg border border-border p-3 text-center">
                <div className="text-lg font-bold text-foreground">{st.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{st.sub}</div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1">{st.label}</div>
              </div>
            ))}
          </div>

          {/* Cert summary bar */}
          {s.certs.length > 0 && (
            <div className="bg-white rounded-lg border border-border p-4 space-y-2">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-foreground">Состояние удостоверений</span>
                <span className="text-muted-foreground">{s.certs.length} шт.</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                {validCount > 0    && <div className="bg-green-500 rounded-full transition-all" style={{ flex: validCount }} />}
                {expiringCount > 0 && <div className="bg-amber-500 rounded-full transition-all" style={{ flex: expiringCount }} />}
                {expiredCount > 0  && <div className="bg-red-500 rounded-full transition-all"   style={{ flex: expiredCount }} />}
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                {validCount > 0    && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{validCount} действуют</span>}
                {expiringCount > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{expiringCount} истекают</span>}
                {expiredCount > 0  && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{expiredCount} просрочено</span>}
              </div>
            </div>
          )}

          {/* Contacts */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Контакты</h3>
            <div className="bg-white rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <Icon name="Phone" size={14} className="text-muted-foreground shrink-0" />
                <a href={`tel:${s.phone}`} className="text-foreground hover:text-epb-blue transition-colors">{s.phone}</a>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Icon name="Mail" size={14} className="text-muted-foreground shrink-0" />
                <a href={`mailto:${s.email}`} className="text-foreground hover:text-epb-blue transition-colors">{s.email}</a>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Icon name="Building2" size={14} className="text-muted-foreground shrink-0" />
                <span className="text-foreground">{s.department}</span>
              </div>
            </div>
          </section>

          {/* Certs */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Удостоверения об аттестации НК <span className="normal-case font-normal">({s.certs.length})</span>
            </h3>
            <div className="space-y-3">
              {s.certs.length === 0
                ? <div className="py-8 text-center text-xs text-muted-foreground bg-white rounded-lg border border-border">
                    Удостоверения не добавлены
                  </div>
                : s.certs.map(c => <CertCard key={c.id} cert={c} />)
              }
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex gap-2">
          <button onClick={onEdit}
            className="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
            <Icon name="Pencil" size={13} /> Редактировать
          </button>
          <button className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1.5">
            <Icon name="Printer" size={13} /> Справка
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted/40 transition-colors">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
