import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  MOCK_REPORTS, STATUS_META, TdStatus, TdReport, ObjType,
} from "./tdReportsData";
import TdReportDetail from "./TdReportDetail";
import TdReportForm from "./TdReportForm";

const ALL_STATUSES: (TdStatus | "all")[] = ["all", "draft", "review", "approved", "issued", "rejected"];
const ALL_OBJ_TYPES: ("all" | ObjType)[] = ["all", "Трубопровод", "Сосуд давления", "Резервуар", "Колонна", "Теплообменник"];

const STATUS_TAB_LABELS: Record<TdStatus | "all", string> = {
  all:      "Все",
  draft:    "Черновики",
  review:   "На проверке",
  approved: "Согласованы",
  issued:   "Выданы",
  rejected: "Отклонённые",
};

export default function TdReportsPage() {
  const [reports, setReports] = useState<TdReport[]>(MOCK_REPORTS);
  const [activeStatus, setActiveStatus] = useState<TdStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [objTypeFilter, setObjTypeFilter] = useState<"all" | ObjType>("all");
  const [defectsFilter, setDefectsFilter] = useState<"all" | "yes" | "no">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<TdReport | null>(null);
  const [editTarget, setEditTarget] = useState<TdReport | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      if (activeStatus !== "all" && r.status !== activeStatus) return false;
      if (objTypeFilter !== "all" && r.objectType !== objTypeFilter) return false;
      if (defectsFilter === "yes" && r.defectCount === 0) return false;
      if (defectsFilter === "no" && r.defectCount > 0) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!r.title.toLowerCase().includes(q) &&
            !r.number.toLowerCase().includes(q) &&
            !r.objectName.toLowerCase().includes(q) &&
            !r.customer.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [reports, activeStatus, objTypeFilter, defectsFilter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reports.length };
    reports.forEach(r => { c[r.status] = (c[r.status] ?? 0) + 1; });
    return c;
  }, [reports]);

  const handleSave = (data: Partial<TdReport>) => {
    if (data.id) {
      setReports(rs => rs.map(r => r.id === data.id ? { ...r, ...data } as TdReport : r));
    } else {
      const newReport: TdReport = { ...data, id: crypto.randomUUID() } as TdReport;
      setReports(rs => [newReport, ...rs]);
    }
    setShowForm(false);
    setEditTarget(undefined);
  };

  const openEdit = (r: TdReport) => {
    setSelected(null);
    setEditTarget(r);
    setShowForm(true);
  };

  const exportCsv = () => {
    const rows = [
      ["Номер", "Наименование", "Объект", "Тип", "ОПО", "Заказчик", "Статус", "Дата создания", "Дефекты", "Ресурс, лет"],
      ...filtered.map(r => [
        r.number, r.title, r.objectName, r.objectType, r.opo, r.customer,
        STATUS_META[r.status].label, r.createdAt, r.defectCount, r.residualLife ?? "",
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "td_reports.csv";
    a.click();
  };

  const hasActiveFilters = objTypeFilter !== "all" || defectsFilter !== "all";

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по номеру, объекту, заказчику..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowFilters(s => !s)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm transition-colors",
              showFilters || hasActiveFilters
                ? "border-epb-blue bg-epb-blue-soft text-epb-blue"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon name="SlidersHorizontal" size={14} />
            Фильтры
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-epb-blue text-white text-[10px] flex items-center justify-center font-bold">
                {[objTypeFilter !== "all", defectsFilter !== "all"].filter(Boolean).length}
              </span>
            )}
          </button>
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="Download" size={14} /> CSV
          </button>
          <button
            onClick={() => { setEditTarget(undefined); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="Plus" size={14} /> Новый отчёт
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-border rounded-lg p-4 flex flex-wrap gap-6 animate-fade-in">
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Тип объекта</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_OBJ_TYPES.map(t => (
                <button key={t} onClick={() => setObjTypeFilter(t)}
                  className={cn("px-2.5 py-1 rounded-md text-xs border transition-colors",
                    objTypeFilter === t ? "border-epb-blue bg-epb-blue-soft text-epb-blue font-medium" : "border-border text-muted-foreground hover:text-foreground"
                  )}>
                  {t === "all" ? "Все типы" : t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Дефекты</label>
            <div className="flex gap-1.5">
              {([["all", "Все"], ["yes", "С дефектами"], ["no", "Без дефектов"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setDefectsFilter(v)}
                  className={cn("px-2.5 py-1 rounded-md text-xs border transition-colors",
                    defectsFilter === v ? "border-epb-blue bg-epb-blue-soft text-epb-blue font-medium" : "border-border text-muted-foreground hover:text-foreground"
                  )}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={() => { setObjTypeFilter("all"); setDefectsFilter("all"); }}
              className="self-end flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
              <Icon name="X" size={12} /> Сбросить фильтры
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
            )}
          >
            {STATUS_TAB_LABELS[s]}
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-semibold",
              activeStatus === s ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}>
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Icon name="FileSearch" size={32} className="text-muted-foreground/40 mx-auto mb-3" fallback="File" />
            <p className="text-sm text-muted-foreground">Отчёты не найдены</p>
            <p className="text-xs text-muted-foreground mt-1">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Номер / Дата</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Объект</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Заказчик</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Протоколы / Дефекты</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden xl:table-cell">Ресурс</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const sm = STATUS_META[r.status];
                return (
                  <tr key={r.id}
                    onClick={() => setSelected(r)}
                    className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-mono font-medium text-foreground">{r.number}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.createdAt}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-medium text-foreground leading-snug max-w-[220px] truncate">{r.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.objectType} · {r.objectName}</div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="text-xs text-foreground max-w-[160px] truncate">{r.customer}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.expert}</div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Icon name="FileText" size={12} />
                        {r.protocols.length} протокол{r.protocols.length !== 1 ? "а" : ""}
                      </div>
                      {r.defectCount > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-red-600 mt-0.5">
                          <Icon name="AlertCircle" size={12} /> {r.defectCount} дефект{r.defectCount > 1 ? "а" : ""}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                          <Icon name="CheckCircle2" size={12} /> Без дефектов
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      {r.residualLife !== undefined ? (
                        <span className={cn("text-xs font-semibold",
                          r.residualLife < 3 ? "text-red-600" : r.residualLife < 6 ? "text-amber-600" : "text-green-600"
                        )}>
                          {r.residualLife} лет
                        </span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("badge-status text-xs", sm.badgeClass)}>{sm.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(r); }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
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

      {/* Footer count */}
      <p className="text-xs text-muted-foreground">
        Показано {filtered.length} из {reports.length} отчётов
      </p>

      {/* Detail panel */}
      {selected && (
        <TdReportDetail
          report={selected}
          onClose={() => setSelected(null)}
          onEdit={() => openEdit(selected)}
        />
      )}

      {/* Form modal */}
      {showForm && (
        <TdReportForm
          initial={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(undefined); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
