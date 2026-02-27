import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { type UserRole } from "@/components/layout/Sidebar";
import DashboardExpert from "./dashboard/DashboardExpert";
import DashboardHead from "./dashboard/DashboardHead";
import DashboardAdmin from "./dashboard/DashboardAdmin";
import DashboardCustomer from "./dashboard/DashboardCustomer";
import ExpertisesPage from "./expertises/ExpertisesPage";
import RegistryPage from "./registry/RegistryPage";
import Placeholder from "./Placeholder";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Дашборд",
  expertises: "Мои экспертизы",
  td_reports: "Отчёты технического диагностирования",
  calculator: "Инженерный калькулятор",
  approval: "Согласование",
  opo: "Мои объекты (ОПО)",
  requests: "Заявки на экспертизу",
  registry: "Реестр заключений ЭПБ",
  instruments: "Приборы и оборудование",
  nk_staff: "Специалисты НК",
  users: "Пользователи",
  references: "Справочники",
  templates: "Шаблоны документов",
  analytics: "Аналитика",
  settings: "Настройки",
};

const PAGE_ICONS: Record<string, string> = {
  expertises: "ClipboardList",
  td_reports: "FileText",
  calculator: "Calculator",
  approval: "CheckSquare",
  opo: "Building2",
  requests: "Send",
  registry: "Archive",
  instruments: "Wrench",
  nk_staff: "UserCheck",
  users: "Users",
  references: "BookOpen",
  templates: "LayoutTemplate",
  analytics: "BarChart3",
  settings: "Settings",
};

function renderDashboard(role: UserRole) {
  switch (role) {
    case "head":      return <DashboardHead />;
    case "admin":     return <DashboardAdmin />;
    case "customer":  return <DashboardCustomer />;
    default:          return <DashboardExpert />;
  }
}

export default function Index() {
  const [activeKey, setActiveKey] = useState("dashboard");
  const [currentRole, setCurrentRole] = useState<UserRole>("expert");

  const title = PAGE_TITLES[activeKey] ?? "Раздел";

  const renderContent = () => {
    if (activeKey === "dashboard") return renderDashboard(currentRole);
    if (activeKey === "expertises") return <ExpertisesPage />;
    if (activeKey === "registry")   return <RegistryPage />;
    return (
      <Placeholder
        title={title}
        icon={PAGE_ICONS[activeKey] ?? "Construction"}
      />
    );
  };

  return (
    <Layout
      title={title}
      activeKey={activeKey}
      currentRole={currentRole}
      onNavigate={setActiveKey}
      onRoleChange={(role) => {
        setCurrentRole(role);
        setActiveKey("dashboard");
      }}
    >
      {renderContent()}
    </Layout>
  );
}