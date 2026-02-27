import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { TdReport, STATUS_META, NkProtocol } from "./tdReportsData";

interface Props {
  report: TdReport;
  onClose: () => void;
  onEdit: () => void;
}

function Field({ label, value, mono }: { label: string; value: string | number | undefined; mono?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className={cn("text-sm text-foreground", mono && "font-mono")}>{value}</div>
    </div>
  );
}

function ProtocolRow({ p }: { p: NkProtocol }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-10 shrink-0">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-muted text-foreground">
          {p.method}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-foreground">{p.number}</div>
        <div className="text-xs text-muted-foreground">{p.specialist} · {p.date}</div>
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs shrink-0",
        p.defectsFound ? "text-red-600" : "text-green-600"
      )}>
        <Icon name={p.defectsFound ? "AlertCircle" : "CheckCircle2"} fallback="Info" size={13} />
        {p.defectsFound ? "Дефекты выявлены" : "Без дефектов"}
      </div>
    </div>
  );
}

export default function TdReportDetail({ report, onClose, onEdit }: Props) {
  const sm = STATUS_META[report.status];
  const canEdit = report.status === "draft" || report.status === "rejected";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl bg-background shadow-xl overflow-y-auto animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-start justify-between gap-3 z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{report.number}</span>
              <span className={cn("badge-status text-xs", sm.badgeClass)}>{sm.label}</span>
            </div>
            <h2 className="text-sm font-semibold text-foreground mt-1 leading-snug">{report.title}</h2>
          </div>
          <button onClick={onClose} className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Object info */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Объект диагностирования</h3>
            <div className="bg-white rounded-lg border border-border p-4 grid grid-cols-2 gap-4">
              <Field label="Наименование" value={report.objectName} />
              <Field label="Тип объекта" value={report.objectType} />
              <Field label="ОПО (рег. №)" value={report.opo} mono />
              <Field label="Заказчик" value={report.customer} />
            </div>
          </section>

          {/* Dates & expert */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Сроки и исполнитель</h3>
            <div className="bg-white rounded-lg border border-border p-4 grid grid-cols-2 gap-4">
              <Field label="Дата создания" value={report.createdAt} />
              <Field label="Ответственный эксперт" value={report.expert} />
              {report.issuedAt && <Field label="Дата выдачи" value={report.issuedAt} />}
              {report.validUntil && <Field label="Действителен до" value={report.validUntil} />}
              {report.residualLife !== undefined && (
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Остаточный ресурс</div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-sm font-semibold",
                      report.residualLife < 3 ? "text-red-600" : report.residualLife < 6 ? "text-amber-600" : "text-green-600"
                    )}>{report.residualLife} лет</span>
                    {report.residualLife < 3 && <Icon name="AlertTriangle" size={13} className="text-red-500" />}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Выявлено дефектов</div>
                <div className={cn(
                  "text-sm font-semibold",
                  report.defectCount === 0 ? "text-green-600" : report.defectCount > 3 ? "text-red-600" : "text-amber-600"
                )}>{report.defectCount} {report.defectCount === 1 ? "дефект" : report.defectCount < 5 ? "дефекта" : "дефектов"}</div>
              </div>
            </div>
          </section>

          {/* NK protocols */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Протоколы НК <span className="normal-case font-normal">({report.protocols.length} шт.)</span>
            </h3>
            <div className="bg-white rounded-lg border border-border px-4 divide-y-0">
              {report.protocols.length === 0
                ? <div className="py-6 text-center text-xs text-muted-foreground">Протоколы не прикреплены</div>
                : report.protocols.map(p => <ProtocolRow key={p.id} p={p} />)
              }
            </div>
          </section>

          {/* Conclusion */}
          {report.conclusion && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Заключение</h3>
              <div className="bg-white rounded-lg border border-green-200 p-4 text-sm text-foreground leading-relaxed">
                {report.conclusion}
              </div>
            </section>
          )}

          {/* Recommendations */}
          {report.recommendations && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Рекомендации</h3>
              <div className="bg-white rounded-lg border border-border p-4 text-sm text-foreground leading-relaxed">
                {report.recommendations}
              </div>
            </section>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex gap-2">
          {canEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
            >
              <Icon name="Pencil" size={13} /> Редактировать
            </button>
          )}
          {report.status === "approved" && (
            <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
              <Icon name="Send" size={13} /> Выдать заказчику
            </button>
          )}
          <button className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1.5">
            <Icon name="Download" size={13} /> PDF
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted/40 transition-colors">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
