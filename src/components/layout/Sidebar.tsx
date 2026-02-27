import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type UserRole = "expert" | "nk_specialist" | "admin" | "customer" | "head";

interface NavItem {
  label: string;
  icon: string;
  key: string;
  roles: UserRole[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Дашборд", icon: "LayoutDashboard", key: "dashboard", roles: ["expert", "nk_specialist", "admin", "customer", "head"] },
    ]
  },
  {
    title: "Работа",
    items: [
      { label: "Мои экспертизы", icon: "ClipboardList", key: "expertises", roles: ["expert", "head"] },
      { label: "Отчёты ТД", icon: "FileText", key: "td_reports", roles: ["expert", "nk_specialist", "head"] },
      { label: "Калькулятор", icon: "Calculator", key: "calculator", roles: ["expert"] },
      { label: "Согласование", icon: "CheckSquare", key: "approval", roles: ["head"] },
      { label: "Мои объекты (ОПО)", icon: "Building2", key: "opo", roles: ["customer"] },
      { label: "Заявки на экспертизу", icon: "Send", key: "requests", roles: ["customer"] },
    ]
  },
  {
    title: "Реестры",
    items: [
      { label: "Реестр заключений", icon: "Archive", key: "registry", roles: ["expert", "admin", "customer", "head"] },
      { label: "Приборы и оборудование", icon: "Wrench", key: "instruments", roles: ["nk_specialist"] },
      { label: "Специалисты НК", icon: "UserCheck", key: "nk_staff", roles: ["nk_specialist"] },
    ]
  },
  {
    title: "Администрирование",
    items: [
      { label: "Пользователи", icon: "Users", key: "users", roles: ["admin", "head"] },
      { label: "Справочники", icon: "BookOpen", key: "references", roles: ["expert", "nk_specialist", "admin", "head"] },
      { label: "Шаблоны", icon: "LayoutTemplate", key: "templates", roles: ["admin", "head"] },
      { label: "Аналитика", icon: "BarChart3", key: "analytics", roles: ["head"] },
    ]
  },
  {
    title: "Система",
    items: [
      { label: "Настройки", icon: "Settings", key: "settings", roles: ["expert", "nk_specialist", "admin", "customer", "head"] },
    ]
  }
];

const ROLE_LABELS: Record<UserRole, string> = {
  expert: "Эксперт ЭПБ",
  nk_specialist: "Специалист НК",
  admin: "Администратор ЭО",
  customer: "Заказчик",
  head: "Руководитель ЭО",
};

interface SidebarProps {
  currentRole: UserRole;
  activeKey: string;
  onNavigate: (key: string) => void;
  collapsed?: boolean;
}

export default function Sidebar({ currentRole, activeKey, onNavigate, collapsed = false }: SidebarProps) {
  const visibleSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(currentRole))
  })).filter(section => section.items.length > 0);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-epb-navy transition-all duration-200 shrink-0",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 h-14 border-b shrink-0",
        "border-sidebar-border"
      )}>
        <div className="flex items-center justify-center w-7 h-7 rounded bg-epb-blue shrink-0">
          <Icon name="Shield" size={15} className="text-white" />
        </div>
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <div className="text-white text-sm font-semibold tracking-tight truncate">Конструктор</div>
            <div className="text-sidebar-foreground text-xs opacity-70 tracking-wide truncate">ЭПБ</div>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-sidebar-accent">
            <Icon name="UserCircle" size={14} className="text-sidebar-primary shrink-0" />
            <span className="text-sidebar-accent-foreground text-xs truncate">{ROLE_LABELS[currentRole]}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {visibleSections.map((section, si) => (
          <div key={si}>
            {section.title && !collapsed && (
              <div className="nav-section">{section.title}</div>
            )}
            {section.items.map(item => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={cn(
                  "nav-item w-full text-left",
                  activeKey === item.key && "active",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon name={item.icon} fallback="Circle" size={16} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border px-2 py-3">
        <button className={cn("nav-item w-full text-left", collapsed && "justify-center px-2")}>
          <Icon name="LogOut" size={16} className="shrink-0" />
          {!collapsed && <span>Выйти</span>}
        </button>
      </div>
    </aside>
  );
}