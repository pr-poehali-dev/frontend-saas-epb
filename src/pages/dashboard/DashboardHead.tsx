import Icon from "@/components/ui/icon";

const stats = [
  { label: "Всего экспертиз (год)", value: "143", icon: "FileStack", color: "text-epb-blue", bg: "bg-epb-blue-soft" },
  { label: "В работе", value: "11", icon: "Activity", color: "text-amber-600", bg: "bg-amber-50" },
  { label: "На согласовании", value: "3", icon: "CheckSquare", color: "text-green-600", bg: "bg-green-50" },
  { label: "Экспертов в штате", value: "6", icon: "Users", color: "text-purple-600", bg: "bg-purple-50" },
];

const approvals = [
  { id: "ЭПБ-2024-041", expert: "Иванов И.И.", object: "Сосуд V-101", days: 2 },
  { id: "ЭПБ-2024-039", expert: "Петров С.В.", object: "Трубопровод Ду200", days: 5 },
  { id: "ЭПБ-2024-037", expert: "Сидорова Е.А.", object: "Котёл КП-10", days: 7 },
];

export default function DashboardHead() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${s.bg}`}>
              <Icon name={s.icon} fallback="Circle" size={16} className={s.color} />
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Awaiting approval */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">На согласовании</h2>
            <span className="badge-review">3 документа</span>
          </div>
          <div className="divide-y divide-border">
            {approvals.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                  {a.expert.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-epb-blue font-medium">{a.id}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{a.expert}</span>
                  </div>
                  <div className="text-sm text-foreground truncate mt-0.5">{a.object}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-muted-foreground">ожидает</div>
                  <div className="text-xs font-medium text-amber-600">{a.days} дн.</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button className="px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-md hover:bg-green-100 transition-colors font-medium">
                    Подписать
                  </button>
                  <button className="px-3 py-1.5 bg-red-50 text-red-700 text-xs rounded-md hover:bg-red-100 transition-colors font-medium">
                    Вернуть
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expert workload */}
        <div className="bg-white rounded-lg border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Загрузка экспертов</h2>
          <div className="space-y-3">
            {[
              { name: "Иванов И.И.", count: 4, max: 6 },
              { name: "Петров С.В.", count: 3, max: 6 },
              { name: "Сидорова Е.А.", count: 2, max: 6 },
              { name: "Козлов А.Р.", count: 1, max: 6 },
              { name: "Морозов Д.В.", count: 1, max: 6 },
            ].map((e, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{e.name}</span>
                  <span className="text-muted-foreground">{e.count}/{e.max}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-epb-blue rounded-full transition-all"
                    style={{ width: `${(e.count / e.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
