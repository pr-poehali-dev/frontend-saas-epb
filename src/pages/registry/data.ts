export type RegistryStatus = "signed" | "registered" | "rejected" | "expired";

export interface RegistryEntry {
  id: string;
  regNumber?: string;
  objectName: string;
  objectType: string;
  customer: string;
  expert: string;
  signedAt: string;
  validUntil: string;
  status: RegistryStatus;
  rtnStatus: "pending" | "registered" | "rejected";
  fileSize?: string;
}

export const REGISTRY_DATA: RegistryEntry[] = [
  {
    id: "ЭПБ-2024-031", regNumber: "РТН-2026-00412",
    objectName: "Насос центробежный НК-200", objectType: "Насос",
    customer: "АО «НефтеХим»", expert: "Иванов И.И.",
    signedAt: "2026-02-20", validUntil: "2031-02-20",
    status: "registered", rtnStatus: "registered", fileSize: "2.4 МБ",
  },
  {
    id: "ЭПБ-2024-028", regNumber: "РТН-2026-00389",
    objectName: "Резервуар РВС-5000", objectType: "Резервуар",
    customer: "ООО «НефтеБаза»", expert: "Иванов И.И.",
    signedAt: "2026-02-05", validUntil: "2031-02-05",
    status: "registered", rtnStatus: "registered", fileSize: "3.1 МБ",
  },
  {
    id: "ЭПБ-2024-021", regNumber: "РТН-2026-00301",
    objectName: "Котёл паровой КП-25", objectType: "Котёл",
    customer: "АО «Энергомаш»", expert: "Петров С.В.",
    signedAt: "2026-01-18", validUntil: "2031-01-18",
    status: "registered", rtnStatus: "registered", fileSize: "1.8 МБ",
  },
  {
    id: "ЭПБ-2024-041",
    objectName: "Сосуд под давлением V-101", objectType: "Сосуд под давлением",
    customer: "АО «НефтеХим»", expert: "Иванов И.И.",
    signedAt: "2026-02-24", validUntil: "2031-02-24",
    status: "signed", rtnStatus: "pending", fileSize: "2.9 МБ",
  },
  {
    id: "ЭПБ-2023-187", regNumber: "РТН-2024-00128",
    objectName: "Трубопровод пара Ду100", objectType: "Трубопровод",
    customer: "ПАО «Газпром»", expert: "Сидорова Е.А.",
    signedAt: "2024-03-10", validUntil: "2029-03-10",
    status: "registered", rtnStatus: "registered", fileSize: "4.2 МБ",
  },
  {
    id: "ЭПБ-2023-164", regNumber: "РТН-2024-00089",
    objectName: "Компрессор К-301", objectType: "Компрессор",
    customer: "ООО «ГазПром»", expert: "Козлов А.Р.",
    signedAt: "2024-01-22", validUntil: "2029-01-22",
    status: "registered", rtnStatus: "registered", fileSize: "1.6 МБ",
  },
  {
    id: "ЭПБ-2024-025",
    objectName: "Компрессор К-302", objectType: "Компрессор",
    customer: "ПАО «Газпром»", expert: "Иванов И.И.",
    signedAt: "2026-01-28", validUntil: "2031-01-28",
    status: "rejected", rtnStatus: "rejected",
  },
  {
    id: "ЭПБ-2019-044", regNumber: "РТН-2019-00512",
    objectName: "Теплообменник Т-201", objectType: "Теплообменник",
    customer: "АО «НефтеХим»", expert: "Морозов Д.В.",
    signedAt: "2019-06-15", validUntil: "2024-06-15",
    status: "expired", rtnStatus: "registered", fileSize: "1.1 МБ",
  },
  {
    id: "ЭПБ-2023-201", regNumber: "РТН-2024-00210",
    objectName: "Сосуд-сепаратор С-102", objectType: "Сосуд под давлением",
    customer: "ООО «НефтеБаза»", expert: "Петров С.В.",
    signedAt: "2024-05-30", validUntil: "2029-05-30",
    status: "registered", rtnStatus: "registered", fileSize: "2.0 МБ",
  },
  {
    id: "ЭПБ-2024-009", regNumber: "РТН-2025-00054",
    objectName: "Котёл водогрейный КВГМ-100", objectType: "Котёл",
    customer: "АО «Энергомаш»", expert: "Сидорова Е.А.",
    signedAt: "2025-08-11", validUntil: "2030-08-11",
    status: "registered", rtnStatus: "registered", fileSize: "3.5 МБ",
  },
];

export const STATUS_CONFIG: Record<RegistryStatus, { label: string; cls: string }> = {
  signed:     { label: "Подписан",   cls: "badge-review" },
  registered: { label: "Зарег. РТН", cls: "badge-signed" },
  rejected:   { label: "Отклонён",   cls: "badge-urgent" },
  expired:    { label: "Истёк",      cls: "badge-draft" },
};

export const RTN_CONFIG = {
  pending:    { label: "Ожидает",    cls: "text-amber-600" },
  registered: { label: "Зарег.",     cls: "text-green-600" },
  rejected:   { label: "Отклонён",   cls: "text-red-600" },
};

export const OBJECT_TYPES_FILTER = [
  "Все типы",
  "Сосуд под давлением",
  "Трубопровод",
  "Котёл",
  "Насос",
  "Резервуар",
  "Компрессор",
  "Теплообменник",
];
