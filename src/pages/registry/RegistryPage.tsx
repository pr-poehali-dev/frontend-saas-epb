import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  REGISTRY_DATA,
  STATUS_CONFIG,
  RTN_CONFIG,
  OBJECT_TYPES_FILTER,
  type RegistryStatus,
} from "./data";

type SortField = "id" | "signedAt" | "validUntil" | "customer";
type SortDir = "asc" | "desc";

const STATUS_TABS: { key: RegistryStatus | "all"; label: string }[] = [
  { key: "all",        label: "Все" },
  { key: "registered", label: "Зарег. РТН" },
  { key: "signed",     label: "Подписаны" },
  { key: "rejected",   label: "Отклонены" },
  { key: "expired",    label: "Истёкшие" },
];

function exportCSV(data: typeof REGISTRY_DATA) {
  const header = ["№ Экспертизы", "Рег. номер РТН", "Объект", "Тип", "Заказчик", "Эксперт", "Дата подписания", "Действителен до", "Статус"];
  const rows = data.map(r => [
    r.id, r.regNumber ?? "—", r.objectName, r.objectType,
    r.customer, r.expert,
    r.signedAt, r.validUntil,
    STATUS_CONFIG[r.status].label,
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "реестр_эпб.csv"; a.click();
  URL.revokeObjectURL(url);
}

function fmt(iso: string) {
  const [y, m, d] = iso.split("-"); return `${d}.${m}.${y}`;
}

function isExpiring(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= 180;
}

export default function RegistryPage() {
  const [statusFilter, setStatusFilter] = useState<RegistryStatus | "all">("all");
  const [typeFilter,   setTypeFilter]   = useState("Все типы");
  const [search,       setSearch]       = useState("");
  const [yearFrom,     setYearFrom]     = useState("");
  const [yearTo,       setYearTo]       = useState("");
  const [sortField,    setSortField]    = useState<SortField>("signedAt");
  const [sortDir,      setSortDir]      = useState<SortDir>("desc");
  const [showFilters,  setShowFilters]  = useState(false);
  const [selected,     setSelected]     = useState<string | null>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    let data = REGISTRY_DATA.filter(r => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "Все типы" && r.objectType !== typeFilter) return false;
      if (yearFrom && r.signedAt.slice(0, 4) < yearFrom) return false;
      if (yearTo   && r.signedAt.slice(0, 4) > yearTo)   return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.id.toLowerCase().includes(q) &&
          !r.objectName.toLowerCase().includes(q) &&
          !r.customer.toLowerCase().includes(q) &&
          !(r.regNumber ?? "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });

    data = [...data].sort((a, b) => {
      const va = a[sortField] ?? "", vb = b[sortField] ?? "";
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [statusFilter, typeFilter, search, yearFrom, yearTo, sortField, sortDir]);

  const counts: Record<string, number> = { all: REGISTRY_DATA.length };
  REGISTRY_DATA.forEach(r => { counts[r.status] = (counts[r.status] ?? 0) + 1; });

  const SortIcon = ({ field }: { field: SortField }) => (
    <Icon
      name={sortField === field ? (sortDir === "asc" ? "ChevronUp" : "ChevronDown") : "ChevronsUpDown"}
      size={12}
      className={sortField === field ? "text-foreground" : "text-muted-foreground/50"}
    />
  );

  const hasActiveFilters = typeFilter !== "Все типы" || yearFrom || yearTo;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по номеру, объекту, заказчику, рег. номеру РТН..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Icon name="X" size={13} />
            </button>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors",
              showFilters || hasActiveFilters
                ? "border-epb-blue bg-epb-blue-soft text-epb-blue"
                : "border-border bg-white text-foreground hover:bg-muted/40"
            )}
          >
            <Icon name="SlidersHorizontal" size={14} />
            Фильтры
            {hasActiveFilters && (
              <span className="w-4 h-4 bg-epb-blue text-white rounded-full text-xs flex items-center justify-center leading-none">
                {(typeFilter !== "Все типы" ? 1 : 0) + (yearFrom ? 1 : 0) + (yearTo ? 1 : 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm text-foreground bg-white hover:bg-muted/40 transition-colors"
          >
            <Icon name="Download" size={14} />
            Экспорт CSV
          </button>
        </div>
      </div>

      {/* Extended filters panel */}
      {showFilters && (
        <div className="bg-white border border-border rounded-lg p-4 animate-fade-in">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Тип объекта</label>
              <select
                value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {OBJECT_TYPES_FILTER.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Год подписания — от</label>
              <input
                type="number" value={yearFrom} onChange={e => setYearFrom(e.target.value)}
                placeholder="2020" min="2000" max="2030"
                className="w-24 border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">до</label>
              <input
                type="number" value={yearTo} onChange={e => setYearTo(e.target.value)}
                placeholder="2026" min="2000" max="2030"
                className="w-24 border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => { setTypeFilter("Все типы"); setYearFrom(""); setYearTo(""); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pb-0.5"
              >
                <Icon name="X" size={12} /> Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 bg-muted/60 p-1 rounded-lg w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key} onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              statusFilter === tab.key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {counts[tab.key] !== undefined && (
              <span className={cn(
                "px-1.5 py-0.5 rounded text-xs leading-none",
                statusFilter === tab.key ? "bg-muted text-foreground" : "bg-muted/80 text-muted-foreground"
              )}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Summary strip */}
      <div className="flex gap-6 px-1">
        {[
          { label: "Всего в реестре", value: REGISTRY_DATA.length },
          { label: "Зарегистрировано РТН", value: counts["registered"] ?? 0 },
          { label: "Истекают (180 дн.)", value: REGISTRY_DATA.filter(r => r.status === "registered" && isExpiring(r.validUntil)).length },
          { label: "Истёкших", value: counts["expired"] ?? 0 },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-lg font-bold text-foreground leading-none">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Icon name="SearchX" size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Ничего не найдено</p>
            <p className="text-xs text-muted-foreground mt-1">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  <button onClick={() => toggleSort("id")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    № Экспертизы <SortIcon field="id" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden xl:table-cell">Рег. номер РТН</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Объект</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Тип</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                  <button onClick={() => toggleSort("customer")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Заказчик <SortIcon field="customer" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Эксперт</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  <button onClick={() => toggleSort("signedAt")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Подписан <SortIcon field="signedAt" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden xl:table-cell">
                  <button onClick={() => toggleSort("validUntil")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Действителен до <SortIcon field="validUntil" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Статус</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const cfg = STATUS_CONFIG[item.status];
                const rtn = RTN_CONFIG[item.rtnStatus];
                const expiring = item.status === "registered" && isExpiring(item.validUntil);
                const isSelected = selected === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(isSelected ? null : item.id)}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors cursor-pointer",
                      isSelected ? "bg-epb-blue-soft" : "hover:bg-muted/20"
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-epb-blue font-semibold">{item.id}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden xl:table-cell">
                      {item.regNumber
                        ? <span className="font-mono text-xs text-muted-foreground">{item.regNumber}</span>
                        : <span className="text-xs text-muted-foreground/40">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 max-w-[220px]">
                      <div className="font-medium text-foreground leading-snug truncate">{item.objectName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 md:hidden">{item.objectType}</div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{item.objectType}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-foreground">{item.customer}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{item.expert}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-muted-foreground">{fmt(item.signedAt)}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden xl:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-xs", expiring ? "text-amber-600 font-medium" : "text-muted-foreground")}>
                          {fmt(item.validUntil)}
                        </span>
                        {expiring && <Icon name="AlertTriangle" size={12} className="text-amber-500" />}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={cfg.cls}>{cfg.label}</span>
                        <span className={cn("text-xs", rtn.cls)}>{rtn.label} РТН</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        {item.fileSize && (
                          <button
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-epb-blue hover:underline"
                            title={`Скачать PDF (${item.fileSize})`}
                          >
                            <Icon name="FileDown" size={13} />
                          </button>
                        )}
                        <button
                          onClick={e => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Icon name="MoreVertical" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Показано {filtered.length} из {REGISTRY_DATA.length}
            </span>
            <div className="flex gap-1">
              <button className="px-2.5 py-1 border border-border rounded text-xs text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-40" disabled>
                ← Назад
              </button>
              <button className="px-2.5 py-1 border border-border rounded text-xs bg-white text-foreground font-medium">1</button>
              <button className="px-2.5 py-1 border border-border rounded text-xs text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-40" disabled>
                Далее →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
