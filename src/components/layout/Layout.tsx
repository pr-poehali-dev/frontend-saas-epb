import { useState, useEffect } from "react";
import Sidebar, { type UserRole } from "./Sidebar";
import Header from "./Header";

const STORAGE_KEY = "epb_sidebar_collapsed";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  activeKey: string;
  currentRole: UserRole;
  onNavigate: (key: string) => void;
  onRoleChange: (role: UserRole) => void;
}

export default function Layout({ children, title, activeKey, currentRole, onNavigate, onRoleChange }: LayoutProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); }
    catch { /* ignore */ }
  }, [collapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        currentRole={currentRole}
        activeKey={activeKey}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          title={title}
          currentRole={currentRole}
          onRoleChange={onRoleChange}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}