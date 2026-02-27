export type TdStatus = "draft" | "review" | "approved" | "issued" | "rejected";
export type NkMethod = "УЗТ" | "УЗК" | "МПД" | "ВТД" | "ЦД" | "ВИК" | "РГК";
export type ObjType = "Трубопровод" | "Сосуд давления" | "Резервуар" | "Колонна" | "Теплообменник";

export interface NkProtocol {
  id: string;
  method: NkMethod;
  number: string;
  date: string;
  specialist: string;
  defectsFound: boolean;
  fileName?: string;
}

export interface TdReport {
  id: string;
  number: string;
  title: string;
  objectName: string;
  objectType: ObjType;
  opo: string;
  status: TdStatus;
  createdAt: string;
  updatedAt: string;
  issuedAt?: string;
  validUntil?: string;
  expert: string;
  customer: string;
  protocols: NkProtocol[];
  residualLife?: number;
  defectCount: number;
  conclusion?: string;
  recommendations?: string;
}

export const STATUS_META: Record<TdStatus, { label: string; badgeClass: string; icon: string }> = {
  draft:    { label: "Черновик",          badgeClass: "badge-draft",   icon: "FileEdit" },
  review:   { label: "На проверке",       badgeClass: "badge-review",  icon: "Eye" },
  approved: { label: "Согласован",        badgeClass: "badge-signed",  icon: "CheckCircle2" },
  issued:   { label: "Выдан",            badgeClass: "badge-signed",  icon: "Award" },
  rejected: { label: "Отклонён",         badgeClass: "badge-urgent",  icon: "XCircle" },
};

const mk = (
  id: string, num: string, title: string, obj: string, objType: ObjType, opo: string,
  status: TdStatus, created: string, expert: string, customer: string,
  protocols: NkProtocol[], residualLife: number | undefined, defects: number,
  issued?: string, valid?: string
): TdReport => ({
  id, number: num, title, objectName: obj, objectType: objType, opo, status,
  createdAt: created, updatedAt: created, issuedAt: issued, validUntil: valid,
  expert, customer, protocols, residualLife, defectCount: defects,
  conclusion: status === "issued" || status === "approved"
    ? "Техническое состояние объекта удовлетворительное. Эксплуатация возможна при соблюдении режима нагружения в соответствии с паспортными данными."
    : undefined,
  recommendations: defects > 0
    ? "Выполнить ремонтно-восстановительные работы на дефектных участках. Повысить периодичность мониторинга коррозионного износа."
    : "Продолжить эксплуатацию в штатном режиме. Следующее обследование — по графику.",
});

const p = (id: string, method: NkMethod, num: string, date: string, spec: string, def: boolean): NkProtocol =>
  ({ id, method, number: num, date, specialist: spec, defectsFound: def });

export const MOCK_REPORTS: TdReport[] = [
  mk("1", "ТД-2025-001", "ТД трубопровода пара высокого давления", "Паропровод Ду200 Ру40", "Трубопровод",
    "А43-02341-0012", "issued", "2025-03-10", "Карпов А.И.", "ПАО «Газпром нефть»",
    [
      p("p1", "УЗТ", "УЗТ-2025-012", "2025-02-15", "Иванов П.С.", false),
      p("p2", "УЗК", "УЗК-2025-008", "2025-02-16", "Иванов П.С.", true),
      p("p3", "ВИК", "ВИК-2025-031", "2025-02-14", "Карпов А.И.", false),
    ], 8.4, 2, "2025-03-20", "2029-03-20"),

  mk("2", "ТД-2025-002", "ТД сосуда давления (сепаратор)", "Сепаратор С-101", "Сосуд давления",
    "А43-02341-0012", "approved", "2025-04-05", "Белов С.К.", "ПАО «Газпром нефть»",
    [
      p("p4", "УЗТ", "УЗТ-2025-021", "2025-03-28", "Соколов Д.В.", false),
      p("p5", "МПД", "МПД-2025-005", "2025-03-29", "Соколов Д.В.", true),
      p("p6", "ВИК", "ВИК-2025-044", "2025-03-27", "Белов С.К.", true),
    ], 6.1, 3),

  mk("3", "ТД-2025-003", "ТД резервуара вертикального стального", "РВС-5000 №3", "Резервуар",
    "А43-18754-0031", "review", "2025-05-12", "Орлов В.Н.", "ООО «Лукойл-Пермь»",
    [
      p("p7", "УЗТ", "УЗТ-2025-034", "2025-05-05", "Орлов В.Н.", false),
      p("p8", "ВТД", "ВТД-2025-002", "2025-05-06", "Нефёдов М.А.", false),
    ], 11.2, 0),

  mk("4", "ТД-2025-004", "ТД колонны ректификационной К-2", "Колонна К-2", "Колонна",
    "А43-18754-0031", "draft", "2025-06-01", "Зайцев К.Е.", "ООО «Лукойл-Пермь»",
    [
      p("p9", "ВИК", "ВИК-2025-062", "2025-05-28", "Зайцев К.Е.", false),
    ], undefined, 0),

  mk("5", "ТД-2025-005", "ТД теплообменника Т-101/1", "Теплообменник Т-101/1", "Теплообменник",
    "А43-99021-0008", "rejected", "2025-04-20", "Морозов П.А.", "АО «Транснефть»",
    [
      p("p10", "УЗТ", "УЗТ-2025-018", "2025-04-14", "Морозов П.А.", true),
      p("p11", "ЦД",  "ЦД-2025-003",  "2025-04-15", "Морозов П.А.", true),
    ], 2.8, 5),

  mk("6", "ТД-2024-089", "ТД газопровода межцехового", "Газопровод Ду100", "Трубопровод",
    "А43-99021-0008", "issued", "2024-11-15", "Карпов А.И.", "АО «Транснефть»",
    [
      p("p12", "УЗТ", "УЗТ-2024-091", "2024-11-08", "Тихонов С.Р.", false),
      p("p13", "МПД", "МПД-2024-014", "2024-11-09", "Тихонов С.Р.", false),
      p("p14", "РГК", "РГК-2024-007", "2024-11-10", "Нефёдов М.А.", false),
    ], 14.0, 0, "2024-11-25", "2028-11-25"),
];
