import { useState } from "react";
import Sidebar, { type UserRole } from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  activeKey: string;
  currentRole: UserRole;
  onNavigate: (key: string) => void;
  onRoleChange: (role: UserRole) => void;
}

export default function Layout({ children, title, activeKey, currentRole, onNavigate, onRoleChange }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        currentRole={currentRole}
        activeKey={activeKey}
        onNavigate={onNavigate}
        collapsed={collapsed}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          title={title}
          currentRole={currentRole}
          onToggleSidebar={() => setCollapsed(v => !v)}
          onRoleChange={onRoleChange}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
