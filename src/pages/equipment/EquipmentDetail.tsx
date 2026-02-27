import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  Equipment, Verification,
  STATUS_META, CATEGORY_LABELS, OWNER_LABELS, CATEGORY_ICONS,
  getVerifStatus, getEquipStatus, lastVerification,
} from "./equipmentData";

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function VerifCard({ v, isCurrent }: { v: Verification; isCurrent: boolean }) {
  const vs = getVerifStatus(v.validUntil);
  const days = daysUntil(v.validUntil);

  const borderColor =
    vs === "overdue"  ? "border-red-200"   :
    vs === "expiring" ? "border-amber-200"  :
                        "border-border";

  const bgColor =
    vs === "overdue"  ? "bg-red-50"   :
    vs === "expiring" ? "bg-amber-50"  :
                        "bg-muted/30";

  const textColor =
    vs === "overdue"  ? "text-red-600"   :
    vs === "expiring" ? "text-amber-600"  :
                        "text-green-600";

  return (
    <div className={cn("rounded-lg border p-4 space-y-3", borderColor, bgColor, isCurrent && "ring-1 ring-epb-blue/30")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-epb-blue inline-block" />}
            Свидетельство о поверке
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">{v.certNumber}</div>
        </div>
        <span className={cn("text-xs font-semibold", textColor)}>
          {vs === "overdue"
            ? `Просрочено ${Math.abs(days)} дн.`
            : vs === "expiring"
            ? `${days} дн.`
            : "Действует"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Дата поверки</div>
          <div className="text-xs font-medium text-foreground">{v.date}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Действительно до</div>
          <div className={cn("text-xs font-medium", textColor)}>{v.validUntil}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Орган по поверке</div>
          <div className="text-xs text-foreground">{v.lab}</div>
        </div>
        {v.nextDate && (
          <div className="col-span-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Плановая дата следующей поверки</div>
            <div className="text-xs text-foreground font-medium">{v.nextDate}</div>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  equipment: Equipment;
  onClose: () => void;
  onEdit: () => void;
}

export default function EquipmentDetail({ equipment: eq, onClose, onEdit }: Props) {
  const status = getEquipStatus(eq);
  const sm = STATUS_META[status];
  const last = lastVerification(eq);
  const sortedVerifs = [...eq.verifications].sort(
    (a, b) => new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime()
  );

  const days = last ? daysUntil(last.validUntil) : null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      <div
        className="relative ml-auto h-full w-full max-w-xl bg-white shadow-2xl flex flex-col animate-slide-in-right overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-epb-blue-soft flex items-center justify-center shrink-0">
                <Icon name={CATEGORY_ICONS[eq.category]} size={20} className="text-epb-blue" fallback="Package" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground leading-snug">{eq.name}</h2>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">{eq.model}</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("badge-status text-xs", sm.badgeClass)}>{sm.label}</span>
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">{eq.category}</span>
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">{OWNER_LABELS[eq.owner]}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card text-center">
              <div className="text-lg font-bold text-foreground">{eq.manufactureYear}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Год выпуска</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-lg font-bold text-foreground">{eq.verifications.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Поверок всего</div>
            </div>
            <div className="stat-card text-center col-span-2">
              {days !== null ? (
                <>
                  <div className={cn("text-lg font-bold",
                    days < 0    ? "text-red-600" :
                    days <= 60  ? "text-amber-600" :
                                  "text-green-600"
                  )}>
                    {days < 0 ? `−${Math.abs(days)} дн.` : `${days} дн.`}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
                    {days < 0 ? "Поверка просрочена" : "До окончания поверки"}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-muted-foreground">—</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Нет данных о поверке</div>
                </>
              )}
            </div>
          </div>

          {/* Passport info */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Паспортные данные</h3>
            <div className="space-y-2.5">
              {[
                { label: "Серийный номер",     value: eq.serial, mono: true },
                { label: "Инвентарный номер",  value: eq.inventoryNo, mono: true },
                { label: "Производитель",      value: eq.manufacturer },
                { label: "Категория НК",       value: CATEGORY_LABELS[eq.category] },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3 text-xs">
                  <span className="text-muted-foreground w-40 shrink-0">{row.label}</span>
                  <span className={cn("text-foreground", row.mono && "font-mono")}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location & responsible */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Местонахождение</h3>
            <div className="space-y-2.5">
              {[
                { icon: "Building2", label: "Подразделение", value: eq.department },
                { icon: "MapPin",    label: "Место хранения", value: eq.location },
                { icon: "User",      label: "Ответственный",  value: eq.responsiblePerson },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 text-xs">
                  <Icon name={row.icon} size={13} className="text-muted-foreground shrink-0" fallback="Info" />
                  <span className="text-muted-foreground w-36 shrink-0">{row.label}</span>
                  <span className="text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verifications */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
              История поверок ({eq.verifications.length})
            </h3>
            {sortedVerifs.length === 0 ? (
              <p className="text-xs text-muted-foreground">Поверки не зарегистрированы</p>
            ) : (
              <div className="space-y-3">
                {sortedVerifs.map((v, i) => (
                  <VerifCard key={v.id} v={v} isCurrent={i === 0} />
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {eq.notes && (
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Примечания</h3>
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3 border border-border">
                {eq.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="Pencil" size={14} /> Редактировать
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}