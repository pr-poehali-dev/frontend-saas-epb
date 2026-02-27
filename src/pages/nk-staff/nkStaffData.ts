export type NkMethod = "УЗК" | "УЗТ" | "МПД" | "ВТД" | "ЦД" | "ВИК" | "РГК" | "АЭ";
export type NkLevel = "I" | "II" | "III";
export type StaffStatus = "active" | "expiring" | "expired" | "inactive";

export interface NkCert {
  id: string;
  method: NkMethod;
  level: NkLevel;
  certNumber: string;
  issuedAt: string;   // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  issuedBy: string;
  objects: string[];  // виды объектов допуска
}

export interface NkSpecialist {
  id: string;
  lastName: string;
  firstName: string;
  patronymic: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  status: StaffStatus;
  certs: NkCert[];
  hiredAt: string;
  photoInitials: string; // инициалы для аватара
  color: string;         // цвет аватара (tailwind bg)
}

export const METHOD_LABELS: Record<NkMethod, string> = {
  "УЗК": "Ультразвуковой контроль",
  "УЗТ": "Ультразвуковая толщинометрия",
  "МПД": "Магнитопорошковая дефектоскопия",
  "ВТД": "Вихретоковый контроль",
  "ЦД":  "Цветная дефектоскопия",
  "ВИК": "Визуально-измерительный контроль",
  "РГК": "Радиографический контроль",
  "АЭ":  "Акустическая эмиссия",
};

export const LEVEL_LABELS: Record<NkLevel, string> = {
  "I":   "I уровень",
  "II":  "II уровень",
  "III": "III уровень",
};

export const STATUS_META: Record<StaffStatus, { label: string; badgeClass: string; icon: string; desc: string }> = {
  active:   { label: "Действующий",    badgeClass: "badge-signed",  icon: "CheckCircle2",  desc: "Все удостоверения действуют" },
  expiring: { label: "Истекает",       badgeClass: "badge-review",  icon: "Clock",         desc: "Одно или более удостоверений истекает в течение 60 дней" },
  expired:  { label: "Просрочен",      badgeClass: "badge-urgent",  icon: "AlertCircle",   desc: "Есть просроченные удостоверения" },
  inactive: { label: "Не активен",     badgeClass: "badge-draft",   icon: "UserX",         desc: "Специалист не задействован" },
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export function getCertStatus(validUntil: string): "valid" | "expiring" | "expired" {
  const d = daysUntil(validUntil);
  if (d < 0) return "expired";
  if (d <= 60) return "expiring";
  return "valid";
}

export function getSpecialistStatus(s: NkSpecialist): StaffStatus {
  if (s.status === "inactive") return "inactive";
  const statuses = s.certs.map(c => getCertStatus(c.validUntil));
  if (statuses.some(s => s === "expired")) return "expired";
  if (statuses.some(s => s === "expiring")) return "expiring";
  return "active";
}

const mkCert = (
  id: string, method: NkMethod, level: NkLevel,
  num: string, issued: string, valid: string, issuedBy: string, objects: string[]
): NkCert => ({ id, method, level, certNumber: num, issuedAt: issued, validUntil: valid, issuedBy, objects });

const mkSpec = (
  id: string, ln: string, fn: string, pn: string,
  pos: string, dept: string, phone: string, email: string,
  status: StaffStatus, hired: string, color: string,
  certs: NkCert[]
): NkSpecialist => ({
  id, lastName: ln, firstName: fn, patronymic: pn,
  position: pos, department: dept, phone, email, status,
  certs, hiredAt: hired,
  photoInitials: `${ln[0]}${fn[0]}`,
  color,
});

export const MOCK_SPECIALISTS: NkSpecialist[] = [
  mkSpec("1", "Иванов", "Павел", "Сергеевич",
    "Ведущий специалист НК", "Лаборатория НК",
    "+7 (912) 345-67-89", "ivanov.ps@expertlab.ru",
    "active", "2018-03-15", "bg-blue-500",
    [
      mkCert("c1", "УЗК", "II", "УЗК-II-2021-00432", "2021-06-10", "2026-06-10", "РОНКТД", ["Трубопроводы", "Сосуды давления", "Металлоконструкции"]),
      mkCert("c2", "УЗТ", "II", "УЗТ-II-2021-00433", "2021-06-10", "2026-06-10", "РОНКТД", ["Трубопроводы", "Резервуары"]),
      mkCert("c3", "ВИК", "III", "ВИК-III-2019-00218", "2019-09-01", "2024-09-01", "РОНКТД", ["Все объекты ОПО"]),
    ]
  ),
  mkSpec("2", "Соколов", "Дмитрий", "Викторович",
    "Специалист НК", "Лаборатория НК",
    "+7 (912) 456-78-90", "sokolov.dv@expertlab.ru",
    "active", "2020-08-01", "bg-green-500",
    [
      mkCert("c4", "МПД", "II", "МПД-II-2022-00156", "2022-03-20", "2027-03-20", "РОНКТД", ["Сосуды давления", "Металлоконструкции"]),
      mkCert("c5", "ЦД",  "II", "ЦД-II-2022-00157",  "2022-03-20", "2027-03-20", "РОНКТД", ["Трубопроводы", "Сосуды давления"]),
      mkCert("c6", "ВИК", "II", "ВИК-II-2022-00158",  "2022-03-20", "2027-03-20", "РОНКТД", ["Трубопроводы"]),
    ]
  ),
  mkSpec("3", "Нефёдов", "Михаил", "Александрович",
    "Специалист НК (РГК)", "Лаборатория НК",
    "+7 (913) 567-89-01", "nefedov.ma@expertlab.ru",
    "expiring", "2019-11-10", "bg-purple-500",
    [
      mkCert("c7", "РГК", "II", "РГК-II-2021-00089", "2021-04-15", "2026-04-15", "РОСТЕХНАДЗОР", ["Трубопроводы", "Сосуды давления"]),
      mkCert("c8", "ВИК", "I",  "ВИК-I-2026-00031",  "2026-01-10", "2026-04-10", "РОНКТД", ["Трубопроводы"]),
    ]
  ),
  mkSpec("4", "Тихонов", "Сергей", "Романович",
    "Специалист НК", "Лаборатория НК",
    "+7 (914) 678-90-12", "tikhonov.sr@expertlab.ru",
    "active", "2021-05-17", "bg-orange-500",
    [
      mkCert("c9",  "УЗК", "I",  "УЗК-I-2023-00712",  "2023-07-01", "2028-07-01", "РОНКТД", ["Трубопроводы"]),
      mkCert("c10", "УЗТ", "II", "УЗТ-II-2023-00713", "2023-07-01", "2028-07-01", "РОНКТД", ["Трубопроводы", "Резервуары"]),
    ]
  ),
  mkSpec("5", "Белов", "Сергей", "Константинович",
    "Руководитель лаборатории НК", "Лаборатория НК",
    "+7 (915) 789-01-23", "belov.sk@expertlab.ru",
    "active", "2015-01-09", "bg-indigo-500",
    [
      mkCert("c11", "УЗК", "III", "УЗК-III-2020-00041", "2020-02-14", "2025-02-14", "РОНКТД", ["Все объекты ОПО"]),
      mkCert("c12", "МПД", "III", "МПД-III-2020-00042", "2020-02-14", "2025-02-14", "РОНКТД", ["Все объекты ОПО"]),
      mkCert("c13", "ВИК", "III", "ВИК-III-2020-00043", "2020-02-14", "2025-02-14", "РОНКТД", ["Все объекты ОПО"]),
      mkCert("c14", "ВТД", "II",  "ВТД-II-2022-00099",  "2022-09-01", "2027-09-01", "РОНКТД", ["Теплообменники", "Трубопроводы"]),
    ]
  ),
  mkSpec("6", "Зайцев", "Кирилл", "Евгеньевич",
    "Специалист НК", "Отдел ТД",
    "+7 (916) 890-12-34", "zaitsev.ke@expertlab.ru",
    "expired", "2022-06-20", "bg-rose-500",
    [
      mkCert("c15", "ВИК", "I",  "ВИК-I-2021-00501",  "2021-10-05", "2024-10-05", "РОНКТД", ["Трубопроводы"]),
      mkCert("c16", "УЗТ", "I",  "УЗТ-I-2021-00502",  "2021-10-05", "2024-10-05", "РОНКТД", ["Резервуары"]),
    ]
  ),
  mkSpec("7", "Морозов", "Пётр", "Алексеевич",
    "Специалист НК", "Отдел ТД",
    "+7 (917) 901-23-45", "morozov.pa@expertlab.ru",
    "active", "2023-02-13", "bg-teal-500",
    [
      mkCert("c17", "УЗК", "I",  "УЗК-I-2023-00891",  "2023-11-20", "2028-11-20", "РОНКТД", ["Трубопроводы"]),
      mkCert("c18", "ЦД",  "I",  "ЦД-I-2023-00892",   "2023-11-20", "2028-11-20", "РОНКТД", ["Трубопроводы", "Сосуды давления"]),
    ]
  ),
  mkSpec("8", "Орлов", "Виктор", "Николаевич",
    "Ведущий специалист НК", "Лаборатория НК",
    "+7 (918) 012-34-56", "orlov.vn@expertlab.ru",
    "inactive", "2017-04-03", "bg-gray-500",
    [
      mkCert("c19", "УЗК", "II", "УЗК-II-2019-00234", "2019-05-15", "2024-05-15", "РОНКТД", ["Резервуары", "Трубопроводы"]),
      mkCert("c20", "ВТД", "II", "ВТД-II-2019-00235", "2019-05-15", "2024-05-15", "РОНКТД", ["Теплообменники"]),
    ]
  ),
];
