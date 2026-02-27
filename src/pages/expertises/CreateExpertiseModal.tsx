import { useState } from "react";
import Icon from "@/components/ui/icon";
import { OBJECT_TYPES } from "./data";

interface CreateExpertiseModalProps {
  onClose: () => void;
  onCreate: (data: { objectName: string; objectType: string; customer: string; deadline: string }) => void;
}

export default function CreateExpertiseModal({ onClose, onCreate }: CreateExpertiseModalProps) {
  const [form, setForm] = useState({
    objectName: "",
    objectType: OBJECT_TYPES[0],
    customer: "",
    deadline: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.objectName.trim()) errs.objectName = "Укажите наименование объекта";
    if (!form.customer.trim()) errs.customer = "Укажите заказчика";
    if (!form.deadline) errs.deadline = "Укажите срок проведения";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Новая экспертиза</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Заполните основные данные об объекте</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Object type */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Тип объекта</label>
            <select
              value={form.objectType}
              onChange={e => set("objectType", e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {OBJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Object name */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Наименование объекта</label>
            <input
              type="text"
              value={form.objectName}
              onChange={e => set("objectName", e.target.value)}
              placeholder="Например: Сосуд под давлением V-101"
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.objectName && <p className="text-xs text-destructive mt-1">{errors.objectName}</p>}
          </div>

          {/* Customer */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Заказчик</label>
            <input
              type="text"
              value={form.customer}
              onChange={e => set("customer", e.target.value)}
              placeholder="Наименование организации"
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.customer && <p className="text-xs text-destructive mt-1">{errors.customer}</p>}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Срок проведения</label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => set("deadline", e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.deadline && <p className="text-xs text-destructive mt-1">{errors.deadline}</p>}
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 p-3 bg-epb-blue-soft rounded-md">
            <Icon name="Info" size={14} className="text-epb-blue mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              После создания экспертизе будет присвоен номер. Вы сможете добавить документы, провести расчёты и подготовить заключение.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted/40 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Создать экспертизу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
