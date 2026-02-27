import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { MOCK_EQUIPMENT, lastVerification, getEquipStatus } from "@/pages/equipment/equipmentData";
import { MOCK_SPECIALISTS, getCertStatus, getSpecialistStatus } from "@/pages/nk-staff/nkStaffData";

// ─── Типы ─────────────────────────────────────────────────────────────────────

type ItemKind = "equipment" | "cert";
type ItemStatus = "overdue" | "expiring" | "active";
type MonthKey = string; // "YYYY-MM"
type ViewMode = "timeline" | "list";
type FilterStatus = "all" | "overdue" | "expiring" | "active";

interface ScheduleItem {
  id: string;
  kind: ItemKind;
  name: string;
  subtitle: string;
  department: string;
  responsible: string;
  validUntil: string;      // YYYY-MM-DD
  nextDate?: string;       // YYYY-MM-DD — плановая дата поверки/аттестации
  status: ItemStatus;
  daysLeft: number;
  badgeClass: string;
  icon: string;
  tag: string;             // УЗТ, МПД, УЗК II и т.п.
}

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function fmt(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

function monthKey(dateStr: string): MonthKey {
  return dateStr.slice(0, 7);
}

function monthLabel(key: MonthKey): string {
  const [y, m] = key.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

function statusFromDays(days: number): ItemStatus {
  if (days < 0) return "overdue";
  if (days <= 60) return "expiring";
  return "active";
}

function badgeFromStatus(s: ItemStatus) {
  if (s === "overdue")  return "badge-urgent";
  if (s === "expiring") return "badge-review";
  return "badge-signed";
}

function statusLabel(s: ItemStatus) {
  if (s === "overdue")  return "Просрочено";
  if (s === "expiring") return "Истекает";
  return "В норме";
}

// ─── Сборка данных из двух источников ────────────────────────────────────────

function buildScheduleItems(): ScheduleItem[] {
  const items: ScheduleItem[] = [];

  // Оборудование
  MOCK_EQUIPMENT.forEach(eq => {
    const st = getEquipStatus(eq);
    if (st === "repair" || st === "decommissioned") return;
    const last = lastVerification(eq);
    if (!last) return;
    const days = daysUntil(last.validUntil);
    const status = statusFromDays(days);
    items.push({
      id:          `eq-${eq.id}`,
      kind:        "equipment",
      name:        eq.name,
      subtitle:    `${eq.model} · ${eq.serial}`,
      department:  eq.department,
      responsible: eq.responsiblePerson,
      validUntil:  last.validUntil,
      nextDate:    last.nextDate,
      status,
      daysLeft:    days,
      badgeClass:  badgeFromStatus(status),
      icon:        "Gauge",
      tag:         eq.category,
    });
  });

  // Удостоверения НК
  MOCK_SPECIALISTS.forEach(sp => {
    const spStatus = getSpecialistStatus(sp);
    if (spStatus === "inactive") return;
    sp.certs.forEach(cert => {
      const days = daysUntil(cert.validUntil);
      if (days > 180) return; // показываем только ближайшие 180 дней + просроченные
      const status = statusFromDays(days);
      items.push({
        id:          `cert-${cert.id}`,
        kind:        "cert",
        name:        `${sp.lastName} ${sp.firstName[0]}. ${sp.patronymic[0]}.`,
        subtitle:    `${sp.position}`,
        department:  sp.department,
        responsible: sp.email,
        validUntil:  cert.validUntil,
        status,
        daysLeft:    days,
        badgeClass:  badgeFromStatus(status),
        icon:        "UserCheck",
        tag:         `${cert.method} ${cert.level}`,
      });
    });
  });

  return items.sort((a, b) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime());
}

// ─── Компоненты ───────────────────────────────────────────────────────────────

function SummaryBar({ items }: { items: ScheduleItem[] }) {
  const overdue  = items.filter(i => i.status === "overdue").length;
  const expiring = items.filter(i => i.status === "expiring").length;
  const active   = items.filter(i => i.status === "active").length;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Просрочено",   count: overdue,  bg: "bg-red-50",    border: "border-red-200",   text: "text-red-700",   icon: "AlertTriangle", iconColor: "text-red-500" },
        { label: "Истекает (60 дн.)", count: expiring, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "Clock",         iconColor: "text-amber-500" },
        { label: "В порядке",    count: active,   bg: "bg-green-50",  border: "border-green-200", text: "text-green-700", icon: "CheckCircle2",  iconColor: "text-green-500" },
      ].map(s => (
        <div key={s.label} className={cn("rounded-lg border p-4 flex items-center gap-3", s.bg, s.border)}>
          <Icon name={s.icon} size={20} className={s.iconColor} fallback="Circle" />
          <div>
            <div className={cn("text-2xl font-bold", s.text)}>{s.count}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DaysBar({ daysLeft }: { daysLeft: number }) {
  if (daysLeft < 0) {
    return <span className="text-xs font-semibold text-red-600">Просрочено {Math.abs(daysLeft)} дн.</span>;
  }
  const pct = Math.min(100, Math.round((daysLeft / 365) * 100));
  const color =
    daysLeft <= 30  ? "bg-red-500"   :
    daysLeft <= 60  ? "bg-amber-500"  :
    daysLeft <= 120 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("text-xs font-medium",
        daysLeft <= 60 ? "text-amber-600" : "text-muted-foreground"
      )}>{daysLeft} дн.</span>
    </div>
  );
}

function ListItem({ item, onClick }: { item: ScheduleItem; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3.5 bg-white border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
    >
      {/* Icon */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        item.kind === "equipment" ? "bg-epb-blue-soft" : "bg-purple-50"
      )}>
        <Icon name={item.icon} size={15}
          className={item.kind === "equipment" ? "text-epb-blue" : "text-purple-500"}
          fallback="Circle" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-foreground truncate">{item.name}</span>
          <span className={cn("badge-status text-[10px]", item.badgeClass)}>{item.tag}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{item.subtitle} · {item.department}</div>
      </div>

      {/* Date */}
      <div className="text-right shrink-0 hidden sm:block">
        <div className="text-xs font-medium text-foreground">{fmt(item.validUntil)}</div>
        {item.nextDate && (
          <div className="text-[10px] text-muted-foreground mt-0.5">→ план {fmt(item.nextDate)}</div>
        )}
      </div>

      {/* Days bar */}
      <div className="shrink-0 hidden md:flex">
        <DaysBar daysLeft={item.daysLeft} />
      </div>

      {/* Status badge */}
      <span className={cn("badge-status text-xs shrink-0 hidden lg:inline-flex", item.badgeClass)}>
        {statusLabel(item.status)}
      </span>
    </div>
  );
}

function TimelineMonth({ monthKey: mk, items, onItemClick }: { monthKey: MonthKey; items: ScheduleItem[]; onItemClick: (i: ScheduleItem) => void }) {
  const now = new Date();
  const [y, m] = mk.split("-").map(Number);
  const isCurrentMonth = now.getFullYear() === y && now.getMonth() + 1 === m;
  const isPast = new Date(y, m - 1) < new Date(now.getFullYear(), now.getMonth());

  return (
    <div className={cn("rounded-lg border overflow-hidden", isCurrentMonth ? "border-epb-blue/40" : "border-border")}>
      <div className={cn(
        "px-4 py-2.5 flex items-center justify-between",
        isCurrentMonth ? "bg-epb-blue-soft border-b border-epb-blue/20" :
        isPast         ? "bg-red-50 border-b border-red-100" :
                         "bg-muted/30 border-b border-border"
      )}>
        <span className={cn("text-xs font-semibold capitalize",
          isCurrentMonth ? "text-epb-blue" :
          isPast         ? "text-red-700"   : "text-foreground"
        )}>
          {monthLabel(mk)}
          {isCurrentMonth && " — текущий месяц"}
        </span>
        <div className="flex items-center gap-2">
          {items.filter(i => i.status === "overdue").length > 0 && (
            <span className="badge-status badge-urgent text-[10px]">
              {items.filter(i => i.status === "overdue").length} просрочено
            </span>
          )}
          {items.filter(i => i.status === "expiring").length > 0 && (
            <span className="badge-status badge-review text-[10px]">
              {items.filter(i => i.status === "expiring").length} истекает
            </span>
          )}
          <span className="text-xs text-muted-foreground">{items.length} позиций</span>
        </div>
      </div>
      <div className="bg-white">
        {items.map(item => (
          <ListItem key={item.id} item={item} onClick={() => onItemClick(item)} />
        ))}
      </div>
    </div>
  );
}

function DetailPanel({ item, onClose }: { item: ScheduleItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      <div
        className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                item.kind === "equipment" ? "bg-epb-blue-soft" : "bg-purple-50"
              )}>
                <Icon name={item.icon} size={20}
                  className={item.kind === "equipment" ? "text-epb-blue" : "text-purple-500"}
                  fallback="Circle" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">{item.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className={cn("badge-status text-xs", item.badgeClass)}>{statusLabel(item.status)}</span>
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-mono">{item.tag}</span>
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
              {item.kind === "equipment" ? "Оборудование" : "Удостоверение НК"}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Срок */}
          <div className="stat-card text-center">
            {item.daysLeft < 0 ? (
              <>
                <div className="text-2xl font-bold text-red-600">{Math.abs(item.daysLeft)} дн.</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Просрочено</div>
              </>
            ) : (
              <>
                <div className={cn("text-2xl font-bold",
                  item.daysLeft <= 60 ? "text-amber-600" : "text-green-600"
                )}>{item.daysLeft} дн.</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Осталось до истечения</div>
              </>
            )}
            <div className="mt-3 w-full h-2 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full rounded-full transition-all",
                item.daysLeft < 0    ? "bg-red-500"   :
                item.daysLeft <= 60  ? "bg-amber-500"  : "bg-green-500"
              )} style={{ width: `${Math.max(2, Math.min(100, (item.daysLeft / 365) * 100))}%` }} />
            </div>
          </div>

          {/* Даты */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Даты</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-xs">
                <Icon name="CalendarX2" size={13} className="text-muted-foreground shrink-0" fallback="Calendar" />
                <span className="text-muted-foreground w-40 shrink-0">Действительно до</span>
                <span className={cn("font-medium",
                  item.daysLeft < 0    ? "text-red-600"   :
                  item.daysLeft <= 60  ? "text-amber-600"  : "text-foreground"
                )}>{fmt(item.validUntil)}</span>
              </div>
              {item.nextDate && (
                <div className="flex items-center gap-3 text-xs">
                  <Icon name="CalendarCheck" size={13} className="text-muted-foreground shrink-0" fallback="Calendar" />
                  <span className="text-muted-foreground w-40 shrink-0">Плановая дата</span>
                  <span className="text-foreground font-medium">{fmt(item.nextDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Контекст */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
              {item.kind === "equipment" ? "Оборудование" : "Специалист"}
            </h3>
            <div className="space-y-2.5">
              {[
                { icon: "Building2", label: "Подразделение", value: item.department },
                { icon: item.kind === "equipment" ? "User" : "Mail", label: item.kind === "equipment" ? "Ответственный" : "Email", value: item.responsible },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 text-xs">
                  <Icon name={row.icon} size={13} className="text-muted-foreground shrink-0" fallback="Info" />
                  <span className="text-muted-foreground w-36 shrink-0">{row.label}</span>
                  <span className="text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Рекомендация */}
          {item.status !== "active" && (
            <div className={cn("rounded-lg border p-4",
              item.status === "overdue" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
            )}>
              <div className={cn("flex items-center gap-2 text-xs font-semibold mb-2",
                item.status === "overdue" ? "text-red-800" : "text-amber-800"
              )}>
                <Icon name={item.status === "overdue" ? "AlertTriangle" : "Bell"} size={13}
                  className={item.status === "overdue" ? "text-red-500" : "text-amber-500"} />
                {item.status === "overdue" ? "Требуется немедленное действие" : "Рекомендуем запланировать заранее"}
              </div>
              <p className={cn("text-xs leading-relaxed",
                item.status === "overdue" ? "text-red-700" : "text-amber-700"
              )}>
                {item.kind === "equipment"
                  ? item.status === "overdue"
                    ? "Поверка просрочена. Эксплуатация прибора без действующего свидетельства о поверке запрещена."
                    : "Рекомендуем направить прибор на поверку не позднее плановой даты во избежание простоя."
                  : item.status === "overdue"
                    ? "Удостоверение НК просрочено. Специалист не имеет права выполнять контроль данным методом."
                    : "Рекомендуем записать специалиста на переаттестацию заблаговременно."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Главная страница ─────────────────────────────────────────────────────────

export default function VerificationSchedulePage() {
  const [viewMode, setViewMode]       = useState<ViewMode>("timeline");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterKind, setFilterKind]   = useState<"all" | ItemKind>("all");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<ScheduleItem | null>(null);

  const allItems = useMemo(() => buildScheduleItems(), []);

  const filtered = useMemo(() => {
    return allItems.filter(item => {
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterKind   !== "all" && item.kind   !== filterKind)   return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const text = `${item.name} ${item.subtitle} ${item.department} ${item.tag}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [allItems, filterStatus, filterKind, search]);

  // Группировка по месяцам для таймлайна
  const byMonth = useMemo(() => {
    const map = new Map<MonthKey, ScheduleItem[]>();
    filtered.forEach(item => {
      const key = monthKey(item.validUntil);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const overdueCount  = allItems.filter(i => i.status === "overdue").length;
  const expiringCount = allItems.filter(i => i.status === "expiring").length;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Summary */}
      <SummaryBar items={allItems} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию, методу, подразделению..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          {/* Kind filter */}
          <div className="flex border border-border rounded-md overflow-hidden text-xs">
            {([["all", "Всё"], ["equipment", "Приборы"], ["cert", "Удостоверения"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilterKind(k)}
                className={cn("px-3 py-2 transition-colors whitespace-nowrap",
                  filterKind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}>{l}</button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex border border-border rounded-md overflow-hidden">
            {(["timeline", "list"] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={cn("px-2.5 py-2 transition-colors",
                  viewMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}>
                <Icon name={mode === "timeline" ? "CalendarDays" : "List"} size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {([
          ["all",      "Все",         allItems.length],
          ["overdue",  "Просрочено",  overdueCount],
          ["expiring", "Истекает",    expiringCount],
          ["active",   "В порядке",   allItems.filter(i => i.status === "active").length],
        ] as const).map(([key, label, count]) => (
          <button key={key} onClick={() => setFilterStatus(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
              filterStatus === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}>
            {label}
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold",
              filterStatus === key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}>{count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-border">
          <Icon name="CalendarSearch" size={32} className="text-muted-foreground/40 mx-auto mb-3" fallback="Calendar" />
          <p className="text-sm text-muted-foreground">Ничего не найдено</p>
        </div>
      ) : viewMode === "timeline" ? (
        <div className="space-y-4">
          {byMonth.map(([mk, items]) => (
            <TimelineMonth key={mk} monthKey={mk} items={items} onItemClick={setSelected} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {filtered.map(item => (
            <ListItem key={item.id} item={item} onClick={() => setSelected(item)} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Показано {filtered.length} позиций · {overdueCount} просрочено · {expiringCount} истекает в течение 60 дней
      </p>

      {selected && (
        <DetailPanel item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
