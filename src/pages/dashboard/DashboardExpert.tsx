import Icon from "@/components/ui/icon";

const stats = [
  { label: "В работе", value: "4", icon: "ClipboardList", color: "text-epb-blue", bg: "bg-epb-blue-soft" },
  { label: "На проверке", value: "2", icon: "Clock", color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Подписано (месяц)", value: "7", icon: "CheckCircle2", color: "text-green-600", bg: "bg-green-50" },
  { label: "Истекает аттестат", value: "18 дней", icon: "AlertTriangle", color: "text-red-600", bg: "bg-red-50" },
];

const tasks = [
  { id: "ЭПБ-2024-041", object: "Сосуд под давлением V-101", customer: "АО «НефтеХим»", status: "review", deadline: "03.03.2026" },
  { id: "ЭПБ-2024-038", object: "Трубопровод технологический Ду200", customer: "ООО «ГазПром»", status: "draft", deadline: "10.03.2026" },
  { id: "ЭПБ-2024-035", object: "Котёл паровой КП-10", customer: "АО «Энергомаш»", status: "draft", deadline: "15.03.2026" },
  { id: "ЭПБ-2024-031", object: "Насос НК-200", customer: "АО «НефтеХим»", status: "signed", deadline: "20.02.2026" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    draft:  { label: "Черновик",    cls: "badge-draft" },
    review: { label: "На проверке", cls: "badge-review" },
    signed: { label: "Подписан",    cls: "badge-signed" },
  };
  const s = map[status] ?? map.draft;
  return <span className={s.cls}>{s.label}</span>;
};

export default function DashboardExpert() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
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
        {/* Tasks table */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Мои экспертизы</h2>
            <button className="text-xs text-epb-blue hover:underline">Все →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">№ Экспертизы</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Объект</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Заказчик</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Статус</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Срок</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="px-5 py-3 font-mono text-xs text-epb-blue font-medium">{t.id}</td>
                    <td className="px-5 py-3 text-foreground max-w-[200px] truncate">{t.object}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.customer}</td>
                    <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{t.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Быстрые действия</h2>
            <div className="space-y-2">
              {[
                { icon: "FilePlus", label: "Создать экспертизу" },
                { icon: "Upload", label: "Загрузить отчёт ТД" },
                { icon: "Calculator", label: "Инженерный расчёт" },
              ].map((a, i) => (
                <button key={i} className="w-full flex items-center gap-3 px-3 py-2 rounded-md border border-border hover:bg-muted/40 transition-colors text-sm text-foreground">
                  <Icon name={a.icon} fallback="Circle" size={15} className="text-epb-blue shrink-0" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attention */}
          <div className="bg-white rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Требует внимания</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-md">
                <Icon name="AlertCircle" size={15} className="text-red-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-red-800">Аттестат эксперта</div>
                  <div className="text-xs text-red-600 mt-0.5">Истекает через 18 дней (17.03.2026)</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-md">
                <Icon name="Clock" size={15} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-amber-800">ЭПБ-2024-041 ожидает подписи</div>
                  <div className="text-xs text-amber-600 mt-0.5">Руководитель вернул на доработку</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
