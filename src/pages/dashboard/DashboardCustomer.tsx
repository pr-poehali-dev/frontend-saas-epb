import Icon from "@/components/ui/icon";

const requests = [
  { id: "ЗАЯ-2024-015", object: "Сосуд V-101 (АО «НефтеХим»)", status: "review", date: "01.03.2026" },
  { id: "ЗАЯ-2024-012", object: "Трубопровод Ду200", status: "signed", date: "14.02.2026" },
  { id: "ЗАЯ-2024-009", object: "Котёл паровой КП-10", status: "signed", date: "28.01.2026" },
];

export default function DashboardCustomer() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Объектов ОПО", value: "8", icon: "Building2", color: "text-epb-blue", bg: "bg-epb-blue-soft" },
          { label: "Заявок в работе", value: "2", icon: "Send", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Готовых заключений", value: "14", icon: "FileCheck", color: "text-green-600", bg: "bg-green-50" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${s.bg}`}>
              <Icon name={s.icon} fallback="Circle" size={16} className={s.color} />
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Мои заявки</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors">
            <Icon name="Plus" size={13} />
            Новая заявка
          </button>
        </div>
        <div className="divide-y divide-border">
          {requests.map((r, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-epb-blue font-medium">{r.id}</div>
                <div className="text-sm text-foreground mt-0.5 truncate">{r.object}</div>
              </div>
              <div className="text-xs text-muted-foreground">{r.date}</div>
              <span className={r.status === "signed" ? "badge-signed" : "badge-review"}>
                {r.status === "signed" ? "Готово" : "В работе"}
              </span>
              {r.status === "signed" && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs text-foreground hover:bg-muted/40 transition-colors">
                  <Icon name="Download" size={12} />
                  Скачать
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
