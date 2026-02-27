import { useState } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { NkMethod, ObjType, NkProtocol, TdReport, TdStatus } from "./tdReportsData";

interface Props {
  initial?: TdReport;
  onClose: () => void;
  onSave: (data: Partial<TdReport>) => void;
}

const OBJ_TYPES: ObjType[] = ["Трубопровод", "Сосуд давления", "Резервуар", "Колонна", "Теплообменник"];
const NK_METHODS: NkMethod[] = ["УЗТ", "УЗК", "МПД", "ВТД", "ЦД", "ВИК", "РГК"];

function mkProtocol(): NkProtocol {
  return { id: crypto.randomUUID(), method: "УЗТ", number: "", date: "", specialist: "", defectsFound: false };
}

export default function TdReportForm({ initial, onClose, onSave }: Props) {
  const isEdit = !!initial;

  const [form, setForm] = useState({
    title:       initial?.title       ?? "",
    objectName:  initial?.objectName  ?? "",
    objectType:  initial?.objectType  ?? "Трубопровод" as ObjType,
    opo:         initial?.opo         ?? "",
    customer:    initial?.customer    ?? "",
    expert:      initial?.expert      ?? "",
    residualLife:initial?.residualLife?.toString() ?? "",
    conclusion:  initial?.conclusion  ?? "",
    recommendations: initial?.recommendations ?? "",
  });
  const [protocols, setProtocols] = useState<NkProtocol[]>(initial?.protocols ?? [mkProtocol()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const set = (k: keyof typeof form, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const updateProtocol = (i: number, k: keyof NkProtocol, v: string | boolean) =>
    setProtocols(ps => ps.map((p, idx) => idx === i ? { ...p, [k]: v } : p));

  const removeProtocol = (i: number) => setProtocols(ps => ps.filter((_, idx) => idx !== i));

  const validate1 = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim())      errs.title      = "Обязательное поле";
    if (!form.objectName.trim()) errs.objectName = "Обязательное поле";
    if (!form.opo.trim())        errs.opo        = "Обязательное поле";
    if (!form.customer.trim())   errs.customer   = "Обязательное поле";
    if (!form.expert.trim())     errs.expert     = "Обязательное поле";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validate1()) return;
    setStep(s => Math.min(3, s + 1) as 1 | 2 | 3);
  };

  const handleSave = (status: TdStatus) => {
    if (step === 1 && !validate1()) return;
    const now = new Date().toISOString().slice(0, 10);
    onSave({
      ...(initial ?? {}),
      title:        form.title,
      objectName:   form.objectName,
      objectType:   form.objectType,
      opo:          form.opo,
      customer:     form.customer,
      expert:       form.expert,
      residualLife: form.residualLife ? parseFloat(form.residualLife) : undefined,
      conclusion:   form.conclusion || undefined,
      recommendations: form.recommendations || undefined,
      protocols,
      status,
      createdAt:    initial?.createdAt ?? now,
      updatedAt:    now,
      defectCount:  protocols.filter(p => p.defectsFound).length,
      number:       initial?.number ?? `ТД-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    });
  };

  const STEPS = ["Объект и реквизиты", "Протоколы НК", "Заключение"];

  const inputCls = (err?: string) => cn(
    "w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground",
    "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
    err ? "border-destructive focus:ring-destructive" : "border-input"
  );

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
              {isEdit ? "Редактировать отчёт ТД" : "Новый отчёт ТД"}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <Icon name="X" size={15} />
            </button>
          </div>
          {/* Steps */}
          <div className="flex items-center gap-0">
            {STEPS.map((label, i) => {
              const n = (i + 1) as 1 | 2 | 3;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                      done   ? "bg-green-600 text-white" :
                      active ? "bg-primary text-primary-foreground" :
                               "bg-muted text-muted-foreground"
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

          {/* Step 1: Object */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Наименование отчёта *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="ТД трубопровода пара высокого давления"
                  className={inputCls(errors.title)} />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Тип объекта *</label>
                  <select value={form.objectType} onChange={e => set("objectType", e.target.value)}
                    className={inputCls()}>
                    {OBJ_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Наименование объекта *</label>
                  <input value={form.objectName} onChange={e => set("objectName", e.target.value)} placeholder="Паропровод Ду200 Ру40"
                    className={inputCls(errors.objectName)} />
                  {errors.objectName && <p className="text-xs text-destructive mt-1">{errors.objectName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Рег. номер ОПО *</label>
                  <input value={form.opo} onChange={e => set("opo", e.target.value)} placeholder="А43-00000-0000"
                    className={inputCls(errors.opo)} />
                  {errors.opo && <p className="text-xs text-destructive mt-1">{errors.opo}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Заказчик *</label>
                  <input value={form.customer} onChange={e => set("customer", e.target.value)} placeholder="ПАО «Газпром нефть»"
                    className={inputCls(errors.customer)} />
                  {errors.customer && <p className="text-xs text-destructive mt-1">{errors.customer}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Ответственный эксперт *</label>
                  <input value={form.expert} onChange={e => set("expert", e.target.value)} placeholder="Иванов А.П."
                    className={inputCls(errors.expert)} />
                  {errors.expert && <p className="text-xs text-destructive mt-1">{errors.expert}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Остаточный ресурс</label>
                  <div className="relative">
                    <input type="number" step="0.1" value={form.residualLife} onChange={e => set("residualLife", e.target.value)}
                      placeholder="8.4" className={cn(inputCls(), "pr-14")} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">лет</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: NK protocols */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Прикрепите протоколы НК, выполненные в рамках диагностирования</p>
                <button onClick={() => setProtocols(ps => [...ps, mkProtocol()])}
                  className="flex items-center gap-1 text-xs text-epb-blue hover:underline shrink-0">
                  <Icon name="Plus" size={12} /> Добавить
                </button>
              </div>

              {protocols.map((p, i) => (
                <div key={p.id} className="bg-white rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Протокол {i + 1}</span>
                    <button onClick={() => removeProtocol(i)} disabled={protocols.length === 1}
                      className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors">
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Метод НК</label>
                      <select value={p.method} onChange={e => updateProtocol(i, "method", e.target.value)}
                        className={cn(inputCls(), "py-1.5")}>
                        {NK_METHODS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Номер протокола</label>
                      <input value={p.number} onChange={e => updateProtocol(i, "number", e.target.value)}
                        placeholder="УЗТ-2025-001" className={inputCls()} />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Дата</label>
                      <input type="date" value={p.date} onChange={e => updateProtocol(i, "date", e.target.value)}
                        className={inputCls()} />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Специалист</label>
                      <input value={p.specialist} onChange={e => updateProtocol(i, "specialist", e.target.value)}
                        placeholder="Иванов П.С." className={inputCls()} />
                    </div>
                  </div>

                  <label className={cn(
                    "flex items-center gap-2.5 cursor-pointer rounded-md px-3 py-2 border transition-colors",
                    p.defectsFound ? "border-red-200 bg-red-50" : "border-border bg-muted/20"
                  )}>
                    <input type="checkbox" checked={p.defectsFound} onChange={e => updateProtocol(i, "defectsFound", e.target.checked)}
                      className="w-4 h-4 accent-red-600" />
                    <span className={cn("text-xs font-medium", p.defectsFound ? "text-red-700" : "text-muted-foreground")}>
                      Дефекты выявлены по результатам контроля
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Conclusion */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Заключение</label>
                <textarea
                  rows={5} value={form.conclusion} onChange={e => set("conclusion", e.target.value)}
                  placeholder="Техническое состояние объекта удовлетворительное. Эксплуатация возможна при соблюдении паспортного режима..."
                  className={cn(inputCls(), "resize-none")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Рекомендации</label>
                <textarea
                  rows={4} value={form.recommendations} onChange={e => set("recommendations", e.target.value)}
                  placeholder="Продолжить эксплуатацию в штатном режиме. Следующее обследование — по графику..."
                  className={cn(inputCls(), "resize-none")}
                />
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                <p className="text-xs font-semibold text-foreground mb-2">Сводка перед сохранением</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div><span className="text-foreground font-medium">Объект:</span> {form.objectName}</div>
                  <div><span className="text-foreground font-medium">Тип:</span> {form.objectType}</div>
                  <div><span className="text-foreground font-medium">Протоколов:</span> {protocols.length}</div>
                  <div><span className="text-foreground font-medium">Дефектов:</span> {protocols.filter(p => p.defectsFound).length}</div>
                  {form.residualLife && <div><span className="text-foreground font-medium">Ресурс:</span> {form.residualLife} лет</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-4 border-t border-border flex items-center gap-2">
          {step > 1 && (
            <button onClick={() => setStep(s => Math.max(1, s - 1) as 1 | 2 | 3)}
              className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1.5">
              <Icon name="ChevronLeft" size={14} /> Назад
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button onClick={handleNext}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
              Далее <Icon name="ChevronRight" size={14} />
            </button>
          ) : (
            <>
              <button onClick={() => handleSave("draft")}
                className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted/40 transition-colors">
                Сохранить черновик
              </button>
              <button onClick={() => handleSave("review")}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                <Icon name="Send" size={13} /> Отправить на проверку
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
