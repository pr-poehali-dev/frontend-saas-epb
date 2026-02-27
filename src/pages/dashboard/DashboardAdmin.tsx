import Icon from "@/components/ui/icon";

const auditLog = [
  { user: "Иванов И.И.", action: "Изменён справочник «Нормативная база»", time: "10:42", type: "edit" },
  { user: "Петров С.В.", action: "Создан шаблон «ЭПБ Сосуд тип-2»", time: "09:15", type: "create" },
  { user: "admin", action: "Добавлен пользователь Морозов Д.В.", time: "вчера", type: "create" },
  { user: "Сидорова Е.А.", action: "Удалена устаревшая запись НК-4", time: "вчера", type: "delete" },
];

export default function DashboardAdmin() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Пользователей", value: "24", icon: "Users", color: "text-epb-blue", bg: "bg-epb-blue-soft" },
          { label: "Шаблонов", value: "18", icon: "LayoutTemplate", color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Записей справочника", value: "342", icon: "BookOpen", color: "text-green-600", bg: "bg-green-50" },
          { label: "Событий за сутки", value: "67", icon: "Activity", color: "text-amber-600", bg: "bg-amber-50" },
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Audit log */}
        <div className="bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Журнал аудита</h2>
            <button className="text-xs text-epb-blue hover:underline">Подробнее →</button>
          </div>
          <div className="divide-y divide-border">
            {auditLog.map((l, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  l.type === "create" ? "bg-green-500" : l.type === "delete" ? "bg-red-500" : "bg-amber-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">{l.user}</div>
                  <div className="text-xs text-muted-foreground truncate">{l.action}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{l.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick admin actions */}
        <div className="bg-white rounded-lg border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Управление системой</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "UserPlus", label: "Добавить пользователя" },
              { icon: "FilePlus2", label: "Новый шаблон" },
              { icon: "BookPlus", label: "Пополнить справочник" },
              { icon: "Download", label: "Экспорт данных" },
              { icon: "Shield", label: "Права и роли" },
              { icon: "Settings2", label: "Системные настройки" },
            ].map((a, i) => (
              <button key={i} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted/40 transition-colors text-center group">
                <div className="w-9 h-9 rounded-md bg-epb-blue-soft flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon name={a.icon} fallback="Circle" size={16} className="text-epb-blue group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs text-foreground leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
