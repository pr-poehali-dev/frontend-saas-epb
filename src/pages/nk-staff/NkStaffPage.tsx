import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  MOCK_SPECIALISTS, STATUS_META, NkSpecialist, StaffStatus,
  NkMethod, NkLevel, METHOD_LABELS, LEVEL_LABELS,
  getCertStatus, getSpecialistStatus,
} from "./nkStaffData";
import NkStaffDetail from "./NkStaffDetail";
import NkStaffForm from "./NkStaffForm";

const ALL_STATUSES: (StaffStatus | "all")[] = ["all", "active", "expiring", "expired", "inactive"];
const STATUS_TAB_LABELS: Record<StaffStatus | "all", string> = {
  all:      "Все",
  active:   "Действующие",
  expiring: "Истекают",
  expired:  "Просрочены",
  inactive: "Не активны",
};

const NK_METHODS: NkMethod[] = ["УЗК", "УЗТ", "МПД", "ВТД", "ЦД", "ВИК", "РГК", "АЭ"];
const NK_LEVELS: NkLevel[] = ["I", "II", "III"];

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function CertBadges({ certs }: { certs: NkSpecialist["certs"] }) {
  const shown = certs.slice(0, 4);
  const rest = certs.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map(c => {
        const cs = getCertStatus(c.validUntil);
        return (
          <span key={c.id} className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border",
            cs === "expired"  ? "bg-red-50 text-red-700 border-red-200" :
            cs === "expiring" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                "bg-muted text-muted-foreground border-border"
          )}>
            {c.method}{c.level}
          </span>
        );
      })}
      {rest > 0 && (
        <span className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground bg-muted border border-border">+{rest}</span>
      )}
    </div>
  );
}

function ExpiringAlert({ specialists }: { specialists: NkSpecialist[] }) {
  const expiring = specialists.flatMap(s =>
    s.certs
      .filter(c => getCertStatus(c.validUntil) === "expiring")
      .map(c => ({ specialist: `${s.lastName} ${s.firstName[0]}.`, method: c.method, level: c.level, days: daysUntil(c.validUntil) }))
  ).sort((a, b) => a.days - b.days).slice(0, 3);

  if (expiring.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
      <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs mb-3">
        <Icon name="Bell" size={14} className="text-amber-600" />
        Требуют переаттестации в ближайшее время
      </div>
      <div className="flex flex-wrap gap-3">
        {expiring.map((e, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-amber-700 bg-white rounded-md border border-amber-200 px-3 py-1.5">
            <Icon name="Clock" size={11} className="text-amber-500" />
            <span className="font-medium">{e.specialist}</span>
            <span className="font-mono">{e.method}{e.level}</span>
            <span className="text-amber-500">— {e.days} дн.</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NkStaffPage() {
  const [specialists, setSpecialists] = useState<NkSpecialist[]>(
    MOCK_SPECIALISTS.map(s => ({ ...s, status: getSpecialistStatus(s) }))
  );
  const [activeStatus, setActiveStatus] = useState<StaffStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<NkMethod | "all">("all");
  const [levelFilter, setLevelFilter] = useState<NkLevel | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selected, setSelected] = useState<NkSpecialist | null>(null);
  const [editTarget, setEditTarget] = useState<NkSpecialist | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    return specialists.filter(s => {
      const status = getSpecialistStatus(s);
      if (activeStatus !== "all" && status !== activeStatus) return false;
      if (methodFilter !== "all" && !s.certs.some(c => c.method === methodFilter)) return false;
      if (levelFilter !== "all" && !s.certs.some(c => c.level === levelFilter)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const full = `${s.lastName} ${s.firstName} ${s.patronymic} ${s.position} ${s.department}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });
  }, [specialists, activeStatus, methodFilter, levelFilter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: specialists.length };
    specialists.forEach(s => {
      const st = getSpecialistStatus(s);
      c[st] = (c[st] ?? 0) + 1;
    });
    return c;
  }, [specialists]);

  const handleSave = (data: NkSpecialist) => {
    if (specialists.find(s => s.id === data.id)) {
      setSpecialists(ss => ss.map(s => s.id === data.id ? data : s));
    } else {
      setSpecialists(ss => [data, ...ss]);
    }
    setShowForm(false);
    setEditTarget(undefined);
  };

  const openEdit = (s: NkSpecialist) => {
    setSelected(null);
    setEditTarget(s);
    setShowForm(true);
  };

  const hasActiveFilters = methodFilter !== "all" || levelFilter !== "all";

  const fullName = (s: NkSpecialist) => `${s.lastName} ${s.firstName} ${s.patronymic}`;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Alert */}
      <ExpiringAlert specialists={specialists} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по ФИО, должности, подразделению..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setShowFilters(s => !s)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm transition-colors",
              showFilters || hasActiveFilters
                ? "border-epb-blue bg-epb-blue-soft text-epb-blue"
                : "border-border text-muted-foreground hover:text-foreground"
            )}>
            <Icon name="SlidersHorizontal" size={14} />
            Фильтры
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-epb-blue text-white text-[10px] flex items-center justify-center font-bold">
                {[methodFilter !== "all", levelFilter !== "all"].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex border border-border rounded-md overflow-hidden">
            {(["table", "cards"] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={cn(
                  "px-2.5 py-2 text-xs transition-colors",
                  viewMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}>
                <Icon name={mode === "table" ? "List" : "LayoutGrid"} size={14} />
              </button>
            ))}
          </div>

          <button
            onClick={() => { setEditTarget(undefined); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="UserPlus" size={14} /> Добавить
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-border rounded-lg p-4 flex flex-wrap gap-6 animate-fade-in">
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Метод НК</label>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setMethodFilter("all")}
                className={cn("px-2.5 py-1 rounded-md text-xs border transition-colors",
                  methodFilter === "all" ? "border-epb-blue bg-epb-blue-soft text-epb-blue font-medium" : "border-border text-muted-foreground hover:text-foreground"
                )}>Все</button>
              {NK_METHODS.map(m => (
                <button key={m} onClick={() => setMethodFilter(m)}
                  className={cn("px-2.5 py-1 rounded-md text-xs border transition-colors font-mono",
                    methodFilter === m ? "border-epb-blue bg-epb-blue-soft text-epb-blue font-medium" : "border-border text-muted-foreground hover:text-foreground"
                  )}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Уровень квалификации</label>
            <div className="flex gap-1.5">
              <button onClick={() => setLevelFilter("all")}
                className={cn("px-2.5 py-1 rounded-md text-xs border transition-colors",
                  levelFilter === "all" ? "border-epb-blue bg-epb-blue-soft text-epb-blue font-medium" : "border-border text-muted-foreground hover:text-foreground"
                )}>Все</button>
              {NK_LEVELS.map(l => (
                <button key={l} onClick={() => setLevelFilter(l)}
                  className={cn("px-2.5 py-1 rounded-md text-xs border transition-colors",
                    levelFilter === l ? "border-epb-blue bg-epb-blue-soft text-epb-blue font-medium" : "border-border text-muted-foreground hover:text-foreground"
                  )}>{LEVEL_LABELS[l]}</button>
              ))}
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={() => { setMethodFilter("all"); setLevelFilter("all"); }}
              className="self-end flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
              <Icon name="X" size={12} /> Сбросить
            </button>
          )}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
              activeStatus === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}>
            {STATUS_TAB_LABELS[s]}
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold",
              activeStatus === s ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}>{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Table view */}
      {viewMode === "table" && (
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Icon name="Users" size={32} className="text-muted-foreground/40 mx-auto mb-3" fallback="User" />
              <p className="text-sm text-muted-foreground">Специалисты не найдены</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Специалист</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Должность / Отдел</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Допуски</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden xl:table-cell">Ближайшее истечение</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Статус</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const status = getSpecialistStatus(s);
                  const sm = STATUS_META[status];
                  const nextExpiry = [...s.certs].sort((a, b) =>
                    new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime()
                  )[0];
                  const days = nextExpiry ? daysUntil(nextExpiry.validUntil) : null;

                  return (
                    <tr key={s.id}
                      onClick={() => setSelected(s)}
                      className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", s.color)}>
                            {s.photoInitials}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-foreground">{fullName(s)}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="text-xs text-foreground">{s.position}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.department}</div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <CertBadges certs={s.certs} />
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        {nextExpiry && days !== null ? (
                          <div>
                            <div className={cn("text-xs font-medium",
                              days < 0 ? "text-red-600" : days <= 60 ? "text-amber-600" : "text-foreground"
                            )}>
                              {nextExpiry.validUntil}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono mt-0.5">
                              {nextExpiry.method}{nextExpiry.level} · {days < 0 ? `просрочен ${Math.abs(days)} дн.` : `${days} дн.`}
                            </div>
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("badge-status text-xs", sm.badgeClass)}>{sm.label}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button onClick={e => { e.stopPropagation(); setSelected(s); }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <Icon name="ChevronRight" size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Cards view */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <Icon name="Users" size={32} className="text-muted-foreground/40 mx-auto mb-3" fallback="User" />
              <p className="text-sm text-muted-foreground">Специалисты не найдены</p>
            </div>
          ) : filtered.map(s => {
            const status = getSpecialistStatus(s);
            const sm = STATUS_META[status];
            return (
              <div key={s.id}
                onClick={() => setSelected(s)}
                className="bg-white rounded-lg border border-border p-5 cursor-pointer hover:shadow-md hover:border-epb-blue/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0", s.color)}>
                      {s.photoInitials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground leading-snug">{s.lastName} {s.firstName[0]}. {s.patronymic[0]}.</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.position}</div>
                    </div>
                  </div>
                  <span className={cn("badge-status text-xs shrink-0", sm.badgeClass)}>{sm.label}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon name="Building2" size={11} /> {s.department}
                  </div>
                  {s.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon name="Phone" size={11} /> {s.phone}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <CertBadges certs={s.certs} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground">
        Показано {filtered.length} из {specialists.length} специалистов
      </p>

      {/* Detail */}
      {selected && (
        <NkStaffDetail
          specialist={selected}
          onClose={() => setSelected(null)}
          onEdit={() => openEdit(selected)}
        />
      )}

      {/* Form */}
      {showForm && (
        <NkStaffForm
          initial={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(undefined); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
