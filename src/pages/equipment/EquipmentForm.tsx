import { useState } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  Equipment, Verification, EquipCategory, OwnerType,
  ALL_CATEGORIES, CATEGORY_LABELS, OWNER_LABELS,
} from "./equipmentData";

const inputCls = (err?: boolean) =>
  cn(
    "w-full px-3 py-2 text-sm border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors",
    err ? "border-destructive focus:ring-destructive" : "border-input"
  );

const selectCls = cn(
  "w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
);

const EMPTY_VERIF = (): Omit<Verification, "id"> => ({
  date: "",
  validUntil: "",
  certNumber: "",
  lab: "",
  nextDate: "",
});

type Step = 1 | 2;

interface Errors {
  name?: string;
  model?: string;
  serial?: string;
  inventoryNo?: string;
  manufacturer?: string;
  department?: string;
  responsiblePerson?: string;
  location?: string;
}

interface Props {
  initial?: Equipment;
  onClose: () => void;
  onSave: (eq: Equipment) => void;
}

export default function EquipmentForm({ initial, onClose, onSave }: Props) {
  const isEdit = !!initial;

  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Errors>({});

  const [name,              setName]              = useState(initial?.name              ?? "");
  const [model,             setModel]             = useState(initial?.model             ?? "");
  const [serial,            setSerial]            = useState(initial?.serial            ?? "");
  const [inventoryNo,       setInventoryNo]       = useState(initial?.inventoryNo       ?? "");
  const [category,          setCategory]          = useState<EquipCategory>(initial?.category ?? "УЗТ");
  const [manufacturer,      setManufacturer]      = useState(initial?.manufacturer      ?? "");
  const [manufactureYear,   setManufactureYear]   = useState(String(initial?.manufactureYear ?? new Date().getFullYear()));
  const [owner,             setOwner]             = useState<OwnerType>(initial?.owner  ?? "own");
  const [department,        setDepartment]        = useState(initial?.department        ?? "");
  const [responsiblePerson, setResponsiblePerson] = useState(initial?.responsiblePerson ?? "");
  const [location,          setLocation]          = useState(initial?.location          ?? "");
  const [notes,             setNotes]             = useState(initial?.notes             ?? "");
  const [status,            setStatus]            = useState(initial?.status            ?? "active" as Equipment["status"]);

  const [verifs, setVerifs] = useState<(Omit<Verification, "id"> & { id: string })[]>(
    initial?.verifications.map(v => ({ ...v })) ?? []
  );

  const validate1 = (): boolean => {
    const e: Errors = {};
    if (!name.trim())              e.name              = "Обязательное поле";
    if (!model.trim())             e.model             = "Обязательное поле";
    if (!serial.trim())            e.serial            = "Обязательное поле";
    if (!inventoryNo.trim())       e.inventoryNo       = "Обязательное поле";
    if (!manufacturer.trim())      e.manufacturer      = "Обязательное поле";
    if (!department.trim())        e.department        = "Обязательное поле";
    if (!responsiblePerson.trim()) e.responsiblePerson = "Обязательное поле";
    if (!location.trim())          e.location          = "Обязательное поле";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate1()) setStep(2);
  };

  const addVerif = () => {
    setVerifs(vs => [...vs, { id: crypto.randomUUID(), ...EMPTY_VERIF() }]);
  };

  const removeVerif = (id: string) => {
    setVerifs(vs => vs.filter(v => v.id !== id));
  };

  const updateVerif = (id: string, field: keyof Omit<Verification, "id">, value: string) => {
    setVerifs(vs => vs.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSave = () => {
    const eq: Equipment = {
      id: initial?.id ?? crypto.randomUUID(),
      name,
      model,
      serial,
      inventoryNo,
      category,
      manufacturer,
      manufactureYear: parseInt(manufactureYear) || new Date().getFullYear(),
      owner,
      department,
      responsiblePerson,
      location,
      status,
      verifications: verifs.map(v => ({ ...v, nextDate: v.nextDate || undefined })),
      notes: notes.trim() || undefined,
    };
    onSave(eq);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isEdit ? "Редактирование оборудования" : "Добавить оборудование"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Шаг {step} из 2</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Icon name="X" size={16} />
            </button>
          </div>
          {/* Step indicator */}
          <div className="flex gap-1.5 mt-3">
            {([1, 2] as Step[]).map(s => (
              <div key={s} className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                step >= s ? "bg-epb-blue" : "bg-muted"
              )} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ---- Step 1 ---- */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Основные данные</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Наименование <span className="text-destructive">*</span>
                    </label>
                    <input value={name} onChange={e => setName(e.target.value)}
                      placeholder="Толщиномер ультразвуковой" className={inputCls(!!errors.name)} />
                    {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Модель <span className="text-destructive">*</span>
                    </label>
                    <input value={model} onChange={e => setModel(e.target.value)}
                      placeholder="Olympus 38DL Plus" className={inputCls(!!errors.model)} />
                    {errors.model && <p className="text-[11px] text-destructive mt-1">{errors.model}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Производитель <span className="text-destructive">*</span></label>
                    <input value={manufacturer} onChange={e => setManufacturer(e.target.value)}
                      placeholder="Olympus NDT" className={inputCls(!!errors.manufacturer)} />
                    {errors.manufacturer && <p className="text-[11px] text-destructive mt-1">{errors.manufacturer}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Серийный номер <span className="text-destructive">*</span></label>
                    <input value={serial} onChange={e => setSerial(e.target.value)}
                      placeholder="KY4021337" className={inputCls(!!errors.serial)} />
                    {errors.serial && <p className="text-[11px] text-destructive mt-1">{errors.serial}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Инвентарный номер <span className="text-destructive">*</span></label>
                    <input value={inventoryNo} onChange={e => setInventoryNo(e.target.value)}
                      placeholder="ОС-00123" className={inputCls(!!errors.inventoryNo)} />
                    {errors.inventoryNo && <p className="text-[11px] text-destructive mt-1">{errors.inventoryNo}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Метод НК</label>
                    <select value={category} onChange={e => setCategory(e.target.value as EquipCategory)} className={selectCls}>
                      {ALL_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c} — {CATEGORY_LABELS[c]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Год выпуска</label>
                    <input type="number" value={manufactureYear} onChange={e => setManufactureYear(e.target.value)}
                      min={1990} max={new Date().getFullYear()} className={inputCls()} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Форма владения</label>
                    <select value={owner} onChange={e => setOwner(e.target.value as OwnerType)} className={selectCls}>
                      {(Object.keys(OWNER_LABELS) as OwnerType[]).map(o => (
                        <option key={o} value={o}>{OWNER_LABELS[o]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Статус</label>
                    <select value={status} onChange={e => setStatus(e.target.value as Equipment["status"])} className={selectCls}>
                      <option value="active">Действующее</option>
                      <option value="repair">На ремонте</option>
                      <option value="decommissioned">Списано</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Местонахождение</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Подразделение <span className="text-destructive">*</span></label>
                    <input value={department} onChange={e => setDepartment(e.target.value)}
                      placeholder="Лаборатория НК" className={inputCls(!!errors.department)} />
                    {errors.department && <p className="text-[11px] text-destructive mt-1">{errors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Ответственный <span className="text-destructive">*</span></label>
                    <input value={responsiblePerson} onChange={e => setResponsiblePerson(e.target.value)}
                      placeholder="Иванов А.В." className={inputCls(!!errors.responsiblePerson)} />
                    {errors.responsiblePerson && <p className="text-[11px] text-destructive mt-1">{errors.responsiblePerson}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Место хранения <span className="text-destructive">*</span></label>
                    <input value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="Комната 204" className={inputCls(!!errors.location)} />
                    {errors.location && <p className="text-[11px] text-destructive mt-1">{errors.location}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Примечания</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      rows={2} placeholder="Дополнительная информация..."
                      className={cn(inputCls(), "resize-none")} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- Step 2 ---- */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Поверки ({verifs.length})
                </h3>
                <button onClick={addVerif}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                  <Icon name="Plus" size={12} /> Добавить поверку
                </button>
              </div>

              {verifs.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg py-10 text-center">
                  <Icon name="ClipboardList" size={28} className="text-muted-foreground/40 mx-auto mb-2" fallback="FileText" />
                  <p className="text-xs text-muted-foreground">Поверки не добавлены</p>
                  <button onClick={addVerif} className="mt-3 text-xs text-epb-blue hover:underline">
                    Добавить первую поверку
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {verifs.map((v, i) => (
                    <div key={v.id} className="border border-border rounded-lg p-4 space-y-3 relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">Поверка #{i + 1}</span>
                        <button onClick={() => removeVerif(v.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors">
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Дата поверки</label>
                          <input type="date" value={v.date} onChange={e => updateVerif(v.id, "date", e.target.value)}
                            className={inputCls()} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Действительно до</label>
                          <input type="date" value={v.validUntil} onChange={e => updateVerif(v.id, "validUntil", e.target.value)}
                            className={inputCls()} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Номер свидетельства</label>
                          <input value={v.certNumber} onChange={e => updateVerif(v.id, "certNumber", e.target.value)}
                            placeholder="СА/12-2024-1045" className={cn(inputCls(), "font-mono text-xs")} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Плановая дата следующей</label>
                          <input type="date" value={v.nextDate ?? ""} onChange={e => updateVerif(v.id, "nextDate", e.target.value)}
                            className={inputCls()} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Орган по поверке</label>
                          <input value={v.lab} onChange={e => updateVerif(v.id, "lab", e.target.value)}
                            placeholder="ФБУ «Ростест-Москва»" className={inputCls()} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          {step === 1 ? (
            <>
              <button onClick={onClose}
                className="px-4 py-2 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                Отмена
              </button>
              <button onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                Далее <Icon name="ChevronRight" size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="ChevronLeft" size={14} /> Назад
              </button>
              <button onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                <Icon name="Save" size={14} /> {isEdit ? "Сохранить" : "Добавить"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}