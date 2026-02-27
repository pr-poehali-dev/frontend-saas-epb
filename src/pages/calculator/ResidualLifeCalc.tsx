import { useState } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Inputs {
  wallActual: string;    // фактическая толщина стенки, мм
  wallMin: string;       // минимально допустимая, мм
  corrosionRate: string; // скорость коррозии, мм/год
  serviceStart: string;  // год ввода в эксплуатацию
  lastInspection: string;// год последнего обследования
  designLife: string;    // проектный срок, лет
}

interface Result {
  residualLife: number;
  nextInspection: number;
  remainingPercent: number;
  verdict: "ok" | "warning" | "critical";
  verdictText: string;
  predictedThickness: Record<number, number>;
}

const FIELD_INFO: Record<keyof Inputs, { label: string; unit: string; hint: string; placeholder: string }> = {
  wallActual:     { label: "Фактическая толщина стенки",         unit: "мм",   hint: "По результатам УЗТ", placeholder: "8.2" },
  wallMin:        { label: "Минимально допустимая толщина",       unit: "мм",   hint: "По нормативному расчёту", placeholder: "4.5" },
  corrosionRate:  { label: "Скорость коррозии",                   unit: "мм/год",hint: "По данным предыдущих обследований", placeholder: "0.15" },
  serviceStart:   { label: "Год ввода в эксплуатацию",            unit: "год",  hint: "По паспорту оборудования", placeholder: "2010" },
  lastInspection: { label: "Год последнего обследования",         unit: "год",  hint: "Дата проведения ТД", placeholder: "2024" },
  designLife:     { label: "Проектный срок службы",               unit: "лет",  hint: "По паспорту или нормативу", placeholder: "20" },
};

function calculate(inp: Inputs): Result | null {
  const t = parseFloat(inp.wallActual);
  const tMin = parseFloat(inp.wallMin);
  const v = parseFloat(inp.corrosionRate);
  const y0 = parseInt(inp.serviceStart);
  const yInsp = parseInt(inp.lastInspection);
  const dLife = parseInt(inp.designLife);

  if ([t, tMin, v, y0, yInsp, dLife].some(isNaN)) return null;
  if (v <= 0 || t <= tMin) return null;

  const residualLife = (t - tMin) / v;
  const serviceYears = yInsp - y0;
  const remainingPercent = Math.min(100, Math.max(0, (residualLife / dLife) * 100));
  const nextInspection = Math.min(Math.floor(residualLife * 0.5), 4); // половина остатка, не более 4 лет

  let verdict: Result["verdict"] = "ok";
  let verdictText = "";
  if (residualLife < 2) {
    verdict = "critical";
    verdictText = "Критическое состояние. Требуется немедленное внеплановое обследование или вывод из эксплуатации.";
  } else if (residualLife < 5) {
    verdict = "warning";
    verdictText = "Повышенный износ. Рекомендуется сокращённый межинспекционный интервал.";
  } else {
    verdictText = "Состояние удовлетворительное. Плановое обследование в соответствии с графиком.";
  }

  const currentYear = yInsp;
  const predictedThickness: Record<number, number> = {};
  for (let i = 0; i <= Math.min(Math.ceil(residualLife) + 1, 10); i++) {
    predictedThickness[currentYear + i] = Math.max(0, t - v * i);
  }

  void serviceYears;
  return { residualLife, nextInspection, remainingPercent, verdict, verdictText, predictedThickness };
}

export default function ResidualLifeCalc() {
  const [inputs, setInputs] = useState<Inputs>({
    wallActual: "", wallMin: "", corrosionRate: "",
    serviceStart: "", lastInspection: "", designLife: "",
  });
  const [result, setResult] = useState<Result | null>(null);
  const [errors, setErrors] = useState<Partial<Inputs>>({});
  const [history, setHistory] = useState<{ label: string; result: Result; inputs: Inputs }[]>([]);

  const set = (key: keyof Inputs, val: string) => {
    setInputs(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: "" }));
  };

  const validate = (): boolean => {
    const errs: Partial<Inputs> = {};
    (Object.keys(inputs) as (keyof Inputs)[]).forEach(k => {
      if (!inputs[k].trim()) errs[k] = "Обязательное поле";
      else if (isNaN(parseFloat(inputs[k]))) errs[k] = "Введите число";
    });
    if (parseFloat(inputs.wallActual) <= parseFloat(inputs.wallMin))
      errs.wallActual = "Должна быть больше минимальной";
    if (parseFloat(inputs.corrosionRate) <= 0)
      errs.corrosionRate = "Должна быть > 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCalc = () => {
    if (!validate()) return;
    const r = calculate(inputs);
    if (!r) return;
    setResult(r);
    setHistory(h => [{
      label: `${inputs.wallActual}мм · ${inputs.corrosionRate}мм/год`,
      result: r,
      inputs: { ...inputs },
    }, ...h.slice(0, 4)]);
  };

  const reset = () => {
    setInputs({ wallActual: "", wallMin: "", corrosionRate: "", serviceStart: "", lastInspection: "", designLife: "" });
    setResult(null);
    setErrors({});
  };

  const verdictColors = {
    ok:       { border: "border-green-200",  bg: "bg-green-50",  text: "text-green-800",  icon: "CheckCircle2",  iconCls: "text-green-600" },
    warning:  { border: "border-amber-200",  bg: "bg-amber-50",  text: "text-amber-800",  icon: "AlertTriangle", iconCls: "text-amber-600" },
    critical: { border: "border-red-200",    bg: "bg-red-50",    text: "text-red-800",    icon: "AlertCircle",   iconCls: "text-red-600" },
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

      {/* Input form */}
      <div className="xl:col-span-2 bg-white rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Оценка остаточного ресурса</h2>
            <p className="text-xs text-muted-foreground mt-0.5">РД 09-539-03 · Методика расчёта остаточного ресурса трубопроводов</p>
          </div>
          <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <Icon name="RotateCcw" size={13} /> Сбросить
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(FIELD_INFO) as (keyof Inputs)[]).map(key => {
              const f = FIELD_INFO[key];
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
                  <div className="relative">
                    <input
                      type="number" step="any" value={inputs[key]}
                      onChange={e => set(key, e.target.value)}
                      placeholder={f.placeholder}
                      className={cn(
                        "w-full border rounded-md px-3 py-2 pr-16 text-sm bg-background text-foreground",
                        "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
                        errors[key] ? "border-destructive focus:ring-destructive" : "border-input"
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono pointer-events-none">
                      {f.unit}
                    </span>
                  </div>
                  {errors[key]
                    ? <p className="text-xs text-destructive mt-1">{errors[key]}</p>
                    : <p className="text-xs text-muted-foreground mt-1">{f.hint}</p>
                  }
                </div>
              );
            })}
          </div>

          <button
            onClick={handleCalc}
            className="mt-6 w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="Calculator" size={15} />
            Рассчитать остаточный ресурс
          </button>
        </div>

        {/* Result */}
        {result && (() => {
          const vc = verdictColors[result.verdict];
          return (
            <div className="px-6 pb-6 space-y-4 animate-fade-in">
              <div className={cn("rounded-lg border p-5", vc.border, vc.bg)}>
                <div className={cn("flex items-center gap-2 font-semibold text-sm mb-4", vc.text)}>
                  <Icon name={vc.icon} fallback="Info" size={16} className={vc.iconCls} />
                  Результат расчёта
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Остаточный ресурс", value: result.residualLife.toFixed(1), unit: "лет" },
                    { label: "Межинспекц. интервал", value: result.nextInspection, unit: "лет" },
                    { label: "Остаток от проектного", value: result.remainingPercent.toFixed(0), unit: "%" },
                    { label: "Рекомендуемый год ТД", value: new Date().getFullYear() + result.nextInspection, unit: "год" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/70 rounded-md p-3 text-center border border-white/50">
                      <div className="text-xl font-bold text-foreground">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.unit}</div>
                      <div className="text-xs text-muted-foreground mt-1 leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Остаток ресурса</span>
                    <span>{result.remainingPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700",
                        result.verdict === "ok" ? "bg-green-500" :
                        result.verdict === "warning" ? "bg-amber-500" : "bg-red-500"
                      )}
                      style={{ width: `${result.remainingPercent}%` }}
                    />
                  </div>
                </div>

                <p className={cn("text-xs mt-3 leading-relaxed", vc.text)}>{result.verdictText}</p>
              </div>

              {/* Thickness forecast table */}
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Icon name="TrendingDown" size={13} className="text-muted-foreground" />
                  Прогноз утонения стенки
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        {Object.keys(result.predictedThickness).map(y => (
                          <th key={y} className="px-3 py-2 text-center font-medium text-muted-foreground">{y}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Object.entries(result.predictedThickness).map(([y, t]) => {
                          const tMin = parseFloat(inputs.wallMin);
                          const isCrit = t <= tMin;
                          const isWarn = t <= tMin * 1.3;
                          return (
                            <td key={y} className={cn(
                              "px-3 py-2 text-center font-mono",
                              isCrit ? "bg-red-50 text-red-700 font-semibold" :
                              isWarn ? "bg-amber-50 text-amber-700" : "text-foreground"
                            )}>
                              {t.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-xs text-muted-foreground mt-1.5">Толщина стенки, мм · красный = ниже допустимого минимума</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Sidebar: formula + history */}
      <div className="space-y-4">
        {/* Formula */}
        <div className="bg-white rounded-lg border border-border p-5">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Icon name="BookOpen" size={13} className="text-muted-foreground" />
            Формула расчёта
          </h3>
          <div className="bg-muted/40 rounded-md p-4 font-mono text-center">
            <div className="text-sm text-foreground font-semibold">T<sub>ост</sub> = (S<sub>факт</sub> − S<sub>мин</sub>) / V<sub>кор</sub></div>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            {[
              ["T ост", "остаточный ресурс, лет"],
              ["S факт", "фактическая толщина стенки, мм"],
              ["S мин", "минимально допустимая толщина, мм"],
              ["V кор", "скорость коррозии, мм/год"],
            ].map(([sym, def]) => (
              <div key={sym} className="flex gap-2">
                <span className="font-mono font-medium text-foreground w-14 shrink-0">{sym}</span>
                <span>— {def}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Интервал между обследованиями принимается не более половины остаточного ресурса, но не более 4 лет согласно РД 09-539-03.
            </p>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-lg border border-border p-5">
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Icon name="History" size={13} className="text-muted-foreground" />
              История расчётов
            </h3>
            <div className="space-y-2">
              {history.map((h, i) => {
                const dot = h.result.verdict === "ok" ? "bg-green-500" : h.result.verdict === "warning" ? "bg-amber-500" : "bg-red-500";
                return (
                  <button
                    key={i}
                    onClick={() => { setInputs(h.inputs); setResult(h.result); }}
                    className="w-full flex items-center gap-3 p-3 rounded-md border border-border hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className={cn("w-2 h-2 rounded-full shrink-0", dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{h.label}</div>
                      <div className="text-xs text-muted-foreground">{h.result.residualLife.toFixed(1)} лет ресурса</div>
                    </div>
                    <Icon name="CornerDownLeft" size={12} className="text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
