import { useState } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  MOCK_EXPERTISES,
  STATUS_CONFIG,
  type Expertise,
  type ExpertiseStatus,
} from "./data";
import CreateExpertiseModal from "./CreateExpertiseModal";

const STATUS_TABS: { key: ExpertiseStatus | "all"; label: string }[] = [
  { key: "all",      label: "Все" },
  { key: "draft",    label: "Черновик" },
  { key: "review",   label: "На проверке" },
  { key: "signed",   label: "Подписаны" },
  { key: "rejected", label: "Возвращены" },
];

export default function ExpertisesPage() {
  const [items, setItems] = useState<Expertise[]>(MOCK_EXPERTISES);
  const [statusFilter, setStatusFilter] = useState<ExpertiseStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = items.filter(e => {
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.id.toLowerCase().includes(q) ||
      e.objectName.toLowerCase().includes(q) ||
      e.customer.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts: Record<string, number> = { all: items.length };
  items.forEach(e => { counts[e.status] = (counts[e.status] ?? 0) + 1; });

  const handleCreate = (data: { objectName: string; objectType: string; customer: string; deadline: string }) => {
    const newItem: Expertise = {
      id: `ЭПБ-2025-${String(items.length + 1).padStart(3, "0")}`,
      objectName: data.objectName,
      objectType: data.objectType,
      customer: data.customer,
      status: "draft",
      createdAt: new Date().toLocaleDateString("ru-RU"),
      deadline: new Date(data.deadline).toLocaleDateString("ru-RU"),
      expert: "Иванов И.И.",
    };
    setItems(prev => [newItem, ...prev]);
    setShowModal(false);
    setStatusFilter("all");
  };

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по номеру, объекту, заказчику..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Icon name="X" size={13} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm text-foreground bg-white hover:bg-muted/40 transition-colors">
            <Icon name="SlidersHorizontal" size={14} />
            Фильтры
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm text-foreground bg-white hover:bg-muted/40 transition-colors">
            <Icon name="Download" size={14} />
            Экспорт
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="Plus" size={14} />
            Создать
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-muted/60 p-1 rounded-lg w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              statusFilter === tab.key
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
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
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    № Экспертизы <Icon name="ChevronsUpDown" size={12} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Объект</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Тип</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Заказчик</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Статус</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Срок <Icon name="ChevronsUpDown" size={12} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden xl:table-cell">Рег. номер РТН</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const cfg = STATUS_CONFIG[item.status];
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
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground leading-snug">{item.objectName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 md:hidden">{item.objectType}</div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{item.objectType}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-foreground">{item.customer}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cfg.cls}>{cfg.label}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className={cn(
                        "text-xs",
                        item.status === "draft" && new Date(item.deadline.split(".").reverse().join("-")) < new Date()
                          ? "text-epb-danger font-medium"
                          : "text-muted-foreground"
                      )}>
                        {item.deadline}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden xl:table-cell">
                      {item.regNumber
                        ? <span className="font-mono text-xs text-muted-foreground">{item.regNumber}</span>
                        : <span className="text-xs text-muted-foreground/50">—</span>
                      }
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        onClick={e => { e.stopPropagation(); }}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                      >
                        <Icon name="MoreVertical" size={15} />
                      </button>
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
              Показано {filtered.length} из {items.length}
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

      {/* Modal */}
      {showModal && (
        <CreateExpertiseModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
