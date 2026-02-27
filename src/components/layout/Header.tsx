import Icon from "@/components/ui/icon";
import { type UserRole } from "./Sidebar";

interface HeaderProps {
  title: string;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: "expert", label: "Эксперт ЭПБ" },
  { value: "nk_specialist", label: "Специалист НК" },
  { value: "admin", label: "Администратор ЭО" },
  { value: "customer", label: "Заказчик" },
  { value: "head", label: "Руководитель ЭО" },
];

export default function Header({ title, currentRole, onRoleChange }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-5 gap-4 shrink-0">
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      </div>

      {/* Quick action */}
      <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors">
        <Icon name="Plus" size={14} />
        Создать
      </button>

      {/* Notification */}
      <button className="relative text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
        <Icon name="Bell" size={18} />
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-epb-danger rounded-full"></span>
      </button>

      {/* Role switcher (demo) */}
      <div className="flex items-center gap-2 border-l border-border pl-4">
        <div className="text-xs text-muted-foreground hidden md:block">Роль:</div>
        <select
          value={currentRole}
          onChange={e => onRoleChange(e.target.value as UserRole)}
          className="text-xs border border-input rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-2 pl-2">
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
          ИИ
        </div>
      </div>
    </header>
  );
}
