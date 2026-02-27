import { useState } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { NkSpecialist, NkCert, NkMethod, NkLevel, METHOD_LABELS, LEVEL_LABELS } from "./nkStaffData";

interface Props {
  initial?: NkSpecialist;
  onClose: () => void;
  onSave: (data: NkSpecialist) => void;
}

const NK_METHODS: NkMethod[] = ["УЗК", "УЗТ", "МПД", "ВТД", "ЦД", "ВИК", "РГК", "АЭ"];
const NK_LEVELS: NkLevel[] = ["I", "II", "III"];
const AVATAR_COLORS = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
  "bg-indigo-500", "bg-rose-500", "bg-teal-500", "bg-cyan-500",
];
const CERT_OBJECTS = ["Трубопроводы", "Сосуды давления", "Резервуары", "Металлоконструкции", "Теплообменники", "Колонны", "Все объекты ОПО"];

function mkCert(): NkCert {
  return {
    id: crypto.randomUUID(), method: "УЗК", level: "I",
    certNumber: "", issuedAt: "", validUntil: "", issuedBy: "РОНКТД", objects: [],
  };
}

export default function NkStaffForm({ initial, onClose, onSave }: Props) {
  const isEdit = !!initial;

  const [form, setForm] = useState({
    lastName:   initial?.lastName   ?? "",
    firstName:  initial?.firstName  ?? "",
    patronymic: initial?.patronymic ?? "",
    position:   initial?.position   ?? "",
    department: initial?.department ?? "",
    phone:      initial?.phone      ?? "",
    email:      initial?.email      ?? "",
    hiredAt:    initial?.hiredAt    ?? "",
    color:      initial?.color      ?? AVATAR_COLORS[0],
  });
  const [certs, setCerts] = useState<NkCert[]>(initial?.certs ?? [mkCert()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1 | 2>(1);

  const set = (k: keyof typeof form, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const updateCert = (i: number, k: keyof NkCert, v: string | string[]) =>
    setCerts(cs => cs.map((c, idx) => idx === i ? { ...c, [k]: v } : c));

  const toggleCertObject = (certIdx: number, obj: string) => {
    const cert = certs[certIdx];
    const next = cert.objects.includes(obj)
      ? cert.objects.filter(o => o !== obj)
      : [...cert.objects, obj];
    updateCert(certIdx, "objects", next);
  };

  const validate1 = () => {
    const errs: Record<string, string> = {};
    if (!form.lastName.trim())   errs.lastName   = "Обязательное поле";
    if (!form.firstName.trim())  errs.firstName  = "Обязательное поле";
    if (!form.position.trim())   errs.position   = "Обязательное поле";
    if (!form.department.trim()) errs.department = "Обязательное поле";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validate1()) return;
    setStep(2);
  };

  const handleSave = () => {
    if (!validate1()) { setStep(1); return; }
    const initials = `${form.lastName[0] ?? "?"}${form.firstName[0] ?? "?"}`;
    onSave({
      ...(initial ?? {}),
      id:            initial?.id ?? crypto.randomUUID(),
      lastName:      form.lastName,
      firstName:     form.firstName,
      patronymic:    form.patronymic,
      position:      form.position,
      department:    form.department,
      phone:         form.phone,
      email:         form.email,
      hiredAt:       form.hiredAt,
      color:         form.color,
      photoInitials: initials,
      status:        initial?.status ?? "active",
      certs,
    });
  };

  const inputCls = (err?: string) => cn(
    "w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground",
    "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
    err ? "border-destructive focus:ring-destructive" : "border-input"
  );

  const STEPS = ["Данные специалиста", "Удостоверения НК"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {isEdit ? "Редактировать специалиста" : "Добавить специалиста НК"}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <Icon name="X" size={15} />
            </button>
          </div>
          {/* Steps */}
          <div className="flex items-center gap-0">
            {STEPS.map((label, i) => {
              const n = (i + 1) as 1 | 2;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                      done ? "bg-green-600 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {done ? <Icon name="Check" size={12} /> : n}
                    </div>
                    <span className={cn("text-xs hidden sm:block", active ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("flex-1 h-px mx-3 transition-colors", step > n ? "bg-green-600" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              {/* Avatar color picker */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">Цвет аватара</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map(c => (
                    <button key={c} onClick={() => set("color", c)}
                      className={cn("w-8 h-8 rounded-full transition-all", c,
                        form.color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-70 hover:opacity-100"
                      )} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Фамилия *</label>
                  <input value={form.lastName} onChange={e => set("lastName", e.target.value)}
                    placeholder="Иванов" className={inputCls(errors.lastName)} />
                  {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Имя *</label>
                  <input value={form.firstName} onChange={e => set("firstName", e.target.value)}
                    placeholder="Павел" className={inputCls(errors.firstName)} />
                  {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Отчество</label>
                  <input value={form.patronymic} onChange={e => set("patronymic", e.target.value)}
                    placeholder="Сергеевич" className={inputCls()} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Должность *</label>
                  <input value={form.position} onChange={e => set("position", e.target.value)}
                    placeholder="Специалист НК" className={inputCls(errors.position)} />
                  {errors.position && <p className="text-xs text-destructive mt-1">{errors.position}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Подразделение *</label>
                  <input value={form.department} onChange={e => set("department", e.target.value)}
                    placeholder="Лаборатория НК" className={inputCls(errors.department)} />
                  {errors.department && <p className="text-xs text-destructive mt-1">{errors.department}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Телефон</label>
                  <input value={form.phone} onChange={e => set("phone", e.target.value)}
                    placeholder="+7 (___) ___-__-__" className={inputCls()} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">E-mail</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder="name@company.ru" className={inputCls()} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Дата приёма на работу</label>
                <input type="date" value={form.hiredAt} onChange={e => set("hiredAt", e.target.value)}
                  className={cn(inputCls(), "w-48")} />
              </div>
            </div>
          )}

          {/* Step 2 — Certs */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Добавьте удостоверения об аттестации по методам НК</p>
                <button onClick={() => setCerts(cs => [...cs, mkCert()])}
                  className="flex items-center gap-1 text-xs text-epb-blue hover:underline">
                  <Icon name="Plus" size={12} /> Добавить
                </button>
              </div>

              {certs.map((cert, i) => (
                <div key={cert.id} className="bg-white rounded-lg border border-border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Удостоверение {i + 1}</span>
                    <button onClick={() => setCerts(cs => cs.filter((_, idx) => idx !== i))}
                      disabled={certs.length === 1}
                      className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors">
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Метод НК</label>
                      <select value={cert.method} onChange={e => updateCert(i, "method", e.target.value)}
                        className={inputCls()}>
                        {NK_METHODS.map(m => <option key={m} value={m}>{m} — {METHOD_LABELS[m].slice(0, 12)}…</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Уровень</label>
                      <select value={cert.level} onChange={e => updateCert(i, "level", e.target.value)}
                        className={inputCls()}>
                        {NK_LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-muted-foreground mb-1">Номер удостоверения</label>
                      <input value={cert.certNumber} onChange={e => updateCert(i, "certNumber", e.target.value)}
                        placeholder="УЗК-II-2024-00001" className={inputCls()} />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Дата выдачи</label>
                      <input type="date" value={cert.issuedAt} onChange={e => updateCert(i, "issuedAt", e.target.value)}
                        className={inputCls()} />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Действует до</label>
                      <input type="date" value={cert.validUntil} onChange={e => updateCert(i, "validUntil", e.target.value)}
                        className={inputCls()} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-muted-foreground mb-1">Орган аттестации</label>
                      <input value={cert.issuedBy} onChange={e => updateCert(i, "issuedBy", e.target.value)}
                        placeholder="РОНКТД" className={inputCls()} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Виды объектов допуска</label>
                    <div className="flex flex-wrap gap-1.5">
                      {CERT_OBJECTS.map(obj => (
                        <button key={obj} type="button"
                          onClick={() => toggleCertObject(i, obj)}
                          className={cn("px-2 py-1 rounded-md text-xs border transition-colors",
                            cert.objects.includes(obj)
                              ? "border-epb-blue bg-epb-blue-soft text-epb-blue font-medium"
                              : "border-border text-muted-foreground hover:text-foreground"
                          )}>
                          {obj}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-4 border-t border-border flex items-center gap-2">
          {step === 2 && (
            <button onClick={() => setStep(1)}
              className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1.5">
              <Icon name="ChevronLeft" size={14} /> Назад
            </button>
          )}
          <div className="flex-1" />
          {step === 1 ? (
            <button onClick={handleNext}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
              Далее <Icon name="ChevronRight" size={14} />
            </button>
          ) : (
            <button onClick={handleSave}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
              <Icon name="Save" size={13} /> Сохранить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
