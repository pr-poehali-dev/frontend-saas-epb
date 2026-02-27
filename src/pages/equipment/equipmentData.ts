export type EquipCategory = "УЗТ" | "УЗК" | "МПД" | "РГК" | "ВТД" | "ЦД" | "ВИК" | "АЭ" | "Прочее";
export type EquipStatus = "active" | "expiring" | "overdue" | "repair" | "decommissioned";
export type VerifStatus = "valid" | "expiring" | "overdue";
export type OwnerType = "own" | "rent" | "leasing";

export interface Verification {
  id: string;
  date: string;
  validUntil: string;
  certNumber: string;
  lab: string;
  nextDate?: string;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  serial: string;
  inventoryNo: string;
  category: EquipCategory;
  manufacturer: string;
  manufactureYear: number;
  owner: OwnerType;
  department: string;
  responsiblePerson: string;
  location: string;
  status: EquipStatus;
  verifications: Verification[];
  notes?: string;
}

export const CATEGORY_LABELS: Record<EquipCategory, string> = {
  "УЗТ": "Ультразвуковая толщинометрия",
  "УЗК": "Ультразвуковой контроль",
  "МПД": "Магнитопорошковая дефектоскопия",
  "РГК": "Радиографический контроль",
  "ВТД": "Вихретоковая дефектоскопия",
  "ЦД":  "Цветная дефектоскопия",
  "ВИК": "Визуально-измерительный контроль",
  "АЭ":  "Акустическая эмиссия",
  "Прочее": "Прочее оборудование",
};

export const OWNER_LABELS: Record<OwnerType, string> = {
  own:     "Собственное",
  rent:    "Аренда",
  leasing: "Лизинг",
};

export const STATUS_META: Record<EquipStatus, { label: string; badgeClass: string; icon: string; color: string }> = {
  active:        { label: "Действующее",    badgeClass: "badge-signed",  icon: "CheckCircle2", color: "text-green-600" },
  expiring:      { label: "Истекает поверка", badgeClass: "badge-review", icon: "Clock",        color: "text-amber-600" },
  overdue:       { label: "Поверка просрочена", badgeClass: "badge-urgent", icon: "AlertTriangle", color: "text-red-600" },
  repair:        { label: "На ремонте",     badgeClass: "badge-draft",   icon: "Wrench",       color: "text-blue-600" },
  decommissioned:{ label: "Списано",        badgeClass: "badge-draft",   icon: "Archive",      color: "text-muted-foreground" },
};

export const CATEGORY_ICONS: Record<EquipCategory, string> = {
  "УЗТ": "Gauge",
  "УЗК": "Waves",
  "МПД": "Magnet",
  "РГК": "Radiation",
  "ВТД": "Radio",
  "ЦД":  "Droplets",
  "ВИК": "Eye",
  "АЭ":  "AudioWaveform",
  "Прочее": "Package",
};

export function getVerifStatus(validUntil: string): VerifStatus {
  const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / 86400000);
  if (days < 0) return "overdue";
  if (days <= 60) return "expiring";
  return "valid";
}

export function getEquipStatus(eq: Equipment): EquipStatus {
  if (eq.status === "repair" || eq.status === "decommissioned") return eq.status;
  if (eq.verifications.length === 0) return "active";
  const last = [...eq.verifications].sort((a, b) =>
    new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime()
  )[0];
  const vs = getVerifStatus(last.validUntil);
  if (vs === "overdue") return "overdue";
  if (vs === "expiring") return "expiring";
  return "active";
}

export function daysUntilExpiry(eq: Equipment): number | null {
  if (eq.verifications.length === 0) return null;
  const last = [...eq.verifications].sort((a, b) =>
    new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime()
  )[0];
  return Math.ceil((new Date(last.validUntil).getTime() - Date.now()) / 86400000);
}

export function lastVerification(eq: Equipment): Verification | null {
  if (eq.verifications.length === 0) return null;
  return [...eq.verifications].sort((a, b) =>
    new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime()
  )[0];
}

export const ALL_CATEGORIES: EquipCategory[] = ["УЗТ", "УЗК", "МПД", "РГК", "ВТД", "ЦД", "ВИК", "АЭ", "Прочее"];

export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: "eq-001",
    name: "Толщиномер ультразвуковой",
    model: "Olympus 38DL Plus",
    serial: "KY4021337",
    inventoryNo: "ОС-00123",
    category: "УЗТ",
    manufacturer: "Olympus NDT",
    manufactureYear: 2019,
    owner: "own",
    department: "Лаборатория НК",
    responsiblePerson: "Смирнов А.В.",
    location: "Комната 204",
    status: "active",
    verifications: [
      {
        id: "v-001-1",
        date: "2024-03-15",
        validUntil: "2026-03-15",
        certNumber: "СА/12-2024-1045",
        lab: "ФБУ «Ростест-Москва»",
        nextDate: "2026-03-01",
      },
    ],
    notes: "Комплект с ПЭП М112-М65-К10-005",
  },
  {
    id: "eq-002",
    name: "Дефектоскоп ультразвуковой",
    model: "SONOCON B",
    serial: "SB-2021-0487",
    inventoryNo: "ОС-00124",
    category: "УЗК",
    manufacturer: "АКС НПО",
    manufactureYear: 2021,
    owner: "own",
    department: "Лаборатория НК",
    responsiblePerson: "Петров И.С.",
    location: "Комната 204",
    status: "expiring",
    verifications: [
      {
        id: "v-002-1",
        date: "2023-08-10",
        validUntil: "2025-08-10",
        certNumber: "СА/12-2023-0782",
        lab: "ФБУ «Ростест-Москва»",
      },
      {
        id: "v-002-2",
        date: "2025-02-10",
        validUntil: "2026-04-10",
        certNumber: "СА/12-2025-0341",
        lab: "ФБУ «Ростест-Москва»",
        nextDate: "2026-03-20",
      },
    ],
  },
  {
    id: "eq-003",
    name: "Магнитный дефектоскоп",
    model: "МИНИМАГ-01",
    serial: "MM-0319-1102",
    inventoryNo: "ОС-00125",
    category: "МПД",
    manufacturer: "Константа-2",
    manufactureYear: 2018,
    owner: "own",
    department: "Участок МПД",
    responsiblePerson: "Козлов Д.Р.",
    location: "Склад оборудования",
    status: "overdue",
    verifications: [
      {
        id: "v-003-1",
        date: "2023-01-20",
        validUntil: "2025-01-20",
        certNumber: "СА/07-2023-0112",
        lab: "ФБУ «Ростест-СПб»",
      },
    ],
    notes: "Требуется внеплановая поверка",
  },
  {
    id: "eq-004",
    name: "Рентгеновский аппарат",
    model: "ERESCO 65MF4",
    serial: "ER65-2020-0091",
    inventoryNo: "ОС-00126",
    category: "РГК",
    manufacturer: "GE Inspection Technologies",
    manufactureYear: 2020,
    owner: "own",
    department: "Участок РГК",
    responsiblePerson: "Фёдоров В.А.",
    location: "Защитная камера №1",
    status: "active",
    verifications: [
      {
        id: "v-004-1",
        date: "2025-05-12",
        validUntil: "2027-05-12",
        certNumber: "СА/15-2025-0551",
        lab: "ФГУП «ВНИИР»",
        nextDate: "2027-04-20",
      },
    ],
    notes: "Лицензия Ростехнадзора ГС-4-50-02/002241 до 12.07.2028",
  },
  {
    id: "eq-005",
    name: "Вихретоковый дефектоскоп",
    model: "ВЕКТОР-21",
    serial: "VE21-2022-0389",
    inventoryNo: "ОС-00127",
    category: "ВТД",
    manufacturer: "НПЦ «КРОПУС»",
    manufactureYear: 2022,
    owner: "rent",
    department: "Лаборатория НК",
    responsiblePerson: "Смирнов А.В.",
    location: "Комната 204",
    status: "active",
    verifications: [
      {
        id: "v-005-1",
        date: "2024-11-01",
        validUntil: "2026-11-01",
        certNumber: "СА/12-2024-2001",
        lab: "ФБУ «Ростест-Москва»",
        nextDate: "2026-10-10",
      },
    ],
    notes: "Договор аренды №А-2022/145 до 31.12.2026",
  },
  {
    id: "eq-006",
    name: "Твердомер ультразвуковой",
    model: "МЕТ-У1",
    serial: "MU-2020-0772",
    inventoryNo: "ОС-00128",
    category: "УЗТ",
    manufacturer: "Метаком",
    manufactureYear: 2020,
    owner: "own",
    department: "Участок входного контроля",
    responsiblePerson: "Николаева О.К.",
    location: "Комната 105",
    status: "repair",
    verifications: [
      {
        id: "v-006-1",
        date: "2023-06-05",
        validUntil: "2025-06-05",
        certNumber: "СА/12-2023-1177",
        lab: "ФБУ «Ростест-Москва»",
      },
    ],
    notes: "Отправлен в сервисный центр 14.01.2026, ожидаемый возврат — март 2026",
  },
  {
    id: "eq-007",
    name: "Прибор ВИК (лупа измерительная)",
    model: "ЛИ-3-10×",
    serial: "LI-0718-0033",
    inventoryNo: "ОС-00129",
    category: "ВИК",
    manufacturer: "ЗОМЗ",
    manufactureYear: 2018,
    owner: "own",
    department: "Лаборатория НК",
    responsiblePerson: "Петров И.С.",
    location: "Комната 204",
    status: "active",
    verifications: [
      {
        id: "v-007-1",
        date: "2025-01-15",
        validUntil: "2026-01-15",
        certNumber: "СА/18-2025-0091",
        lab: "ФГУ «ЦСМ Московский»",
        nextDate: "2025-12-20",
      },
    ],
  },
  {
    id: "eq-008",
    name: "Акустико-эмиссионная система",
    model: "Ладога-АЭ",
    serial: "LA-2019-0056",
    inventoryNo: "ОС-00130",
    category: "АЭ",
    manufacturer: "НКТБ «Диагностика»",
    manufactureYear: 2019,
    owner: "leasing",
    department: "Выездная лаборатория",
    responsiblePerson: "Фёдоров В.А.",
    location: "Склад оборудования",
    status: "active",
    verifications: [
      {
        id: "v-008-1",
        date: "2024-09-20",
        validUntil: "2026-09-20",
        certNumber: "СА/12-2024-1880",
        lab: "ФГУП «ВНИИР»",
        nextDate: "2026-09-01",
      },
    ],
    notes: "Договор лизинга №Л-2019/088",
  },
];
