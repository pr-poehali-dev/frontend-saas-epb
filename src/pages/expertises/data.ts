export type ExpertiseStatus = "draft" | "review" | "signed" | "rejected";

export interface Expertise {
  id: string;
  objectName: string;
  objectType: string;
  customer: string;
  status: ExpertiseStatus;
  createdAt: string;
  deadline: string;
  regNumber?: string;
  expert: string;
}

export const MOCK_EXPERTISES: Expertise[] = [
  {
    id: "ЭПБ-2024-041",
    objectName: "Сосуд под давлением V-101",
    objectType: "Сосуд под давлением",
    customer: "АО «НефтеХим»",
    status: "review",
    createdAt: "15.01.2026",
    deadline: "03.03.2026",
    expert: "Иванов И.И.",
  },
  {
    id: "ЭПБ-2024-038",
    objectName: "Трубопровод технологический Ду200",
    objectType: "Трубопровод",
    customer: "ООО «ГазПром»",
    status: "draft",
    createdAt: "10.01.2026",
    deadline: "10.03.2026",
    expert: "Иванов И.И.",
  },
  {
    id: "ЭПБ-2024-035",
    objectName: "Котёл паровой КП-10",
    objectType: "Котёл",
    customer: "АО «Энергомаш»",
    status: "draft",
    createdAt: "05.01.2026",
    deadline: "15.03.2026",
    expert: "Иванов И.И.",
  },
  {
    id: "ЭПБ-2024-031",
    objectName: "Насос центробежный НК-200",
    objectType: "Насос",
    customer: "АО «НефтеХим»",
    status: "signed",
    createdAt: "20.12.2025",
    deadline: "20.02.2026",
    regNumber: "РТН-2026-00412",
    expert: "Иванов И.И.",
  },
  {
    id: "ЭПБ-2024-028",
    objectName: "Резервуар РВС-5000",
    objectType: "Резервуар",
    customer: "ООО «НефтеБаза»",
    status: "signed",
    createdAt: "10.12.2025",
    deadline: "05.02.2026",
    regNumber: "РТН-2026-00389",
    expert: "Иванов И.И.",
  },
  {
    id: "ЭПБ-2024-025",
    objectName: "Компрессор К-302",
    objectType: "Компрессор",
    customer: "ПАО «Газпром»",
    status: "rejected",
    createdAt: "01.12.2025",
    deadline: "25.01.2026",
    expert: "Иванов И.И.",
  },
];

export const STATUS_CONFIG: Record<ExpertiseStatus, { label: string; cls: string }> = {
  draft:    { label: "Черновик",     cls: "badge-draft" },
  review:   { label: "На проверке",  cls: "badge-review" },
  signed:   { label: "Подписан",     cls: "badge-signed" },
  rejected: { label: "Возвращён",    cls: "badge-urgent" },
};

export const OBJECT_TYPES = [
  "Сосуд под давлением",
  "Трубопровод",
  "Котёл",
  "Насос",
  "Резервуар",
  "Компрессор",
  "Теплообменник",
  "ТДА",
];
