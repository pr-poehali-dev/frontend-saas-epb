import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  MOCK_EQUIPMENT, Equipment, EquipStatus, EquipCategory,
  STATUS_META, CATEGORY_LABELS, CATEGORY_ICONS, OWNER_LABELS, ALL_CATEGORIES,
  getEquipStatus, lastVerification, daysUntilExpiry,
} from "./equipmentData";
import EquipmentDetail from "./EquipmentDetail";
import EquipmentForm from "./EquipmentForm";

const ALL_STATUSES: (EquipStatus | "all")[] = ["all", "active", "expiring", "overdue", "repair", "decommissioned"];
const STATUS_TAB_LABELS: Record<EquipStatus | "all", string> = {
  all:            "Все",
  active:         "Действующие",
  expiring:       "Истекает",
  overdue:        "Просрочены",
  repair:         "Ремонт",
  decommissioned: "Списаны",
};

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function OverdueAlert({ items }: { items: Equipment[] }) {
  const overdue = items.filter(eq => getEquipStatus(eq) === "overdue").length;
  const expiring = items
    .filter(eq => getEquipStatus(eq) === "expiring")
    .map(eq => {
      const last = lastVerification(eq);
      return last ? { name: eq.name, model: eq.model, days: daysUntil(last.validUntil) } : null;
    })
    .filter((x): x is { name: string; model: string; days: number } => x !== null)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);

  if (overdue === 0 && expiring.length === 0) return null;

  return (
    <div className="space-y-2">
      {overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-3.5 flex items-center gap-3">
          <Icon name="AlertTriangle" size={15} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-800 font-medium">
            {overdue} {overdue === 1 ? "прибор" : overdue <= 4 ? "прибора" : "приборов"} с просроченной поверкой — требуется вывод из эксплуатации
          </p>
        </div>
      )}
      {expiring.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs mb-3">
            <Icon name="Bell" size={14} className="text-amber-600" />
            Требуется плановая поверка в ближайшее время
          </div>
          <div className="flex flex-wrap gap-3">
            {expiring.map((e, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-amber-700 bg-white rounded-md border border-amber-200 px-3 py-1.5">
                <Icon name="Clock" size={11} className="text-amber-500" />
                <span className="font-medium">{e.name}</span>
                <span className="text-muted-foreground font-mono">{e.model}</span>
                <span className="text-amber-500">— {e.days} дн.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EquipmentPage() {
  const [items, setItems] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [activeStatus, setActiveStatus] = useState<EquipStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<EquipCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [editTarget, setEditTarget] = useState<Equipment | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    return items.filter(eq => {
      const status = getEquipStatus(eq);
      if (activeStatus !== "all" && status !== activeStatus) return false;
      if (categoryFilter !== "all" && eq.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const text = `${eq.name} ${eq.model} ${eq.serial} ${eq.inventoryNo} ${eq.manufacturer} ${eq.department} ${eq.responsiblePerson}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [items, activeStatus, categoryFilter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach(eq => {
      const st = getEquipStatus(eq);
      c[st] = (c[st] ?? 0) + 1;
    });
    return c;
  }, [items]);

  const handleSave = (eq: Equipment) => {
    if (items.find(i => i.id === eq.id)) {
      setItems(prev => prev.map(i => i.id === eq.id ? eq : i));
    } else {
      setItems(prev => [eq, ...prev]);
    }
    setShowForm(false);
    setEditTarget(undefined);
  };

  const openEdit = (eq: Equipment) => {
    setSelected(null);
    setEditTarget(eq);
    setShowForm(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Alerts */}
      <OverdueAlert items={items} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию, модели, серийному номеру..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setShowFilters(s => !s)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm transition-colors",
              showFilters || categoryFilter !== "all"
                ? "border-epb-blue bg-epb-blue-soft text-epb-blue"
                : "border-border text-muted-foreground hover:text-foreground"
            )}>
            <Icon name="SlidersHorizontal" size={14} />
            Фильтры
            {categoryFilter !== "all" && (
              <span className="w-4 h-4 rounded-full bg-epb-blue text-white text-[10px] flex items-center justify-center font-bold">1</span>
            )}
          </button>

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
            <Icon name="Plus" size={14} /> Добавить
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-border rounded-lg p-4 flex flex-wrap gap-6 animate-fade-in">
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Метод НК</label>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setCategoryFilter("all")}
                className={cn("px-2.5 py-1 rounded-md text-xs border transition-colors",
                  categoryFilter === "all" ? "border-epb-blue bg-epb-blue-soft text-epb-blue font-medium" : "border-border text-muted-foreground hover:text-foreground"
                )}>Все</button>
              {ALL_CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategoryFilter(c)}
                  className={cn("px-2.5 py-1 rounded-md text-xs border transition-colors font-mono",
                    categoryFilter === c ? "border-epb-blue bg-epb-blue-soft text-epb-blue font-medium" : "border-border text-muted-foreground hover:text-foreground"
                  )}>{c}</button>
              ))}
            </div>
          </div>
          {categoryFilter !== "all" && (
            <button onClick={() => setCategoryFilter("all")}
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
              <Icon name="Package" size={32} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Оборудование не найдено</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Оборудование</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Метод НК</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Подразделение</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden xl:table-cell">Поверка до</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Статус</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(eq => {
                  const status = getEquipStatus(eq);
                  const sm = STATUS_META[status];
                  const last = lastVerification(eq);
                  const days = daysUntilExpiry(eq);

                  return (
                    <tr key={eq.id}
                      onClick={() => setSelected(eq)}
                      className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-epb-blue-soft flex items-center justify-center shrink-0">
                            <Icon name={CATEGORY_ICONS[eq.category]} size={15} className="text-epb-blue" fallback="Package" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-foreground">{eq.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 font-mono">{eq.model} · {eq.serial}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-mono">{eq.category}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="text-xs text-foreground">{eq.department}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{eq.responsiblePerson}</div>
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        {last && days !== null ? (
                          <div>
                            <div className={cn("text-xs font-medium",
                              days < 0    ? "text-red-600"   :
                              days <= 60  ? "text-amber-600" : "text-foreground"
                            )}>{last.validUntil}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {days < 0 ? `просрочено ${Math.abs(days)} дн.` : `${days} дн.`}
                            </div>
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("badge-status text-xs", sm.badgeClass)}>{sm.label}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button onClick={e => { e.stopPropagation(); setSelected(eq); }}
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
              <Icon name="Package" size={32} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Оборудование не найдено</p>
            </div>
          ) : filtered.map(eq => {
            const status = getEquipStatus(eq);
            const sm = STATUS_META[status];
            const last = lastVerification(eq);
            const days = last ? daysUntil(last.validUntil) : null;

            return (
              <div key={eq.id}
                onClick={() => setSelected(eq)}
                className="bg-white rounded-lg border border-border p-5 cursor-pointer hover:shadow-md hover:border-epb-blue/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-epb-blue-soft flex items-center justify-center shrink-0">
                      <Icon name={CATEGORY_ICONS[eq.category]} size={18} className="text-epb-blue" fallback="Package" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground leading-snug">{eq.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{eq.model}</div>
                    </div>
                  </div>
                  <span className={cn("badge-status text-xs shrink-0", sm.badgeClass)}>{sm.label}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon name="Building2" size={11} /> {eq.department}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon name="User" size={11} /> {eq.responsiblePerson}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon name="Tag" size={11} /> {OWNER_LABELS[eq.owner]}
                  </div>
                </div>
                {last && days !== null && (
                  <div className={cn(
                    "mt-4 pt-3 border-t border-border text-xs font-medium flex items-center gap-1.5",
                    days < 0    ? "text-red-600"   :
                    days <= 60  ? "text-amber-600"  : "text-green-600"
                  )}>
                    <Icon name="Clock" size={11} />
                    {days < 0
                      ? `Поверка просрочена ${Math.abs(days)} дн.`
                      : `До поверки ${days} дн. (до ${last.validUntil})`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground">
        Показано {filtered.length} из {items.length} единиц оборудования
      </p>

      {/* Detail */}
      {selected && (
        <EquipmentDetail
          equipment={selected}
          onClose={() => setSelected(null)}
          onEdit={() => openEdit(selected)}
        />
      )}

      {/* Form */}
      {showForm && (
        <EquipmentForm
          initial={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(undefined); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
