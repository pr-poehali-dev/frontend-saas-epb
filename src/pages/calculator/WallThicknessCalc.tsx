import { useState } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Inputs {
  pressure: string;       // рабочее давление, МПа
  diameter: string;       // внутренний диаметр, мм
  allowStress: string;    // допускаемое напряжение, МПа
  weldCoeff: string;      // коэффициент сварного шва
  addAllowance: string;   // прибавка к расчётной толщине, мм
}

interface Result {
  calcThickness: number;  // расчётная толщина, мм
  minThickness: number;   // минимальная с прибавкой, мм
  roundedThickness: number;
  verdict: "ok" | "warning";
  actualRatio: number;    // коэфф. использования материала
}

const STEEL_PRESETS = [
  { label: "Сталь 20 (до 300°C)",     stress: "147" },
  { label: "09Г2С (до 400°C)",         stress: "183" },
  { label: "12Х18Н10Т (до 550°C)",    stress: "130" },
  { label: "15Х5М (до 450°C)",         stress: "165" },
  { label: "10Г2 (до 350°C)",          stress: "156" },
];

function roundUpThickness(t: number): number {
  if (t <= 4) return Math.ceil(t * 2) / 2;
  if (t <= 10) return Math.ceil(t);
  return Math.ceil(t / 2) * 2;
}

function calculate(inp: Inputs): Result | null {
  const P = parseFloat(inp.pressure);
  const D = parseFloat(inp.diameter);
  const sigma = parseFloat(inp.allowStress);
  const phi = parseFloat(inp.weldCoeff);
  const c = parseFloat(inp.addAllowance);

  if ([P, D, sigma, phi, c].some(isNaN) || sigma <= 0 || phi <= 0 || phi > 1) return null;

  // ГОСТ 32388: s_p = P·D / (2·[σ]·φ - P)
  const calcThickness = (P * D) / (2 * sigma * phi - P);
  if (calcThickness <= 0) return null;

  const minThickness = calcThickness + c;
  const roundedThickness = roundUpThickness(minThickness);
  const actualRatio = (P * (D + 2 * roundedThickness)) / (2 * sigma * phi * roundedThickness);
  const verdict = actualRatio > 0.9 ? "warning" : "ok";

  return { calcThickness, minThickness, roundedThickness, verdict, actualRatio };
}

export default function WallThicknessCalc() {
  const [inputs, setInputs] = useState<Inputs>({
    pressure: "", diameter: "", allowStress: "", weldCoeff: "1.0", addAllowance: "1.0",
  });
  const [result, setResult] = useState<Result | null>(null);
  const [errors, setErrors] = useState<Partial<Inputs>>({});

  const set = (key: keyof Inputs, val: string) => {
    setInputs(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: "" }));
    setResult(null);
  };

  const validate = (): boolean => {
    const errs: Partial<Inputs> = {};
    if (!inputs.pressure || isNaN(+inputs.pressure) || +inputs.pressure <= 0) errs.pressure = "Введите положительное число";
    if (!inputs.diameter || isNaN(+inputs.diameter) || +inputs.diameter <= 0) errs.diameter = "Введите положительное число";
    if (!inputs.allowStress || isNaN(+inputs.allowStress) || +inputs.allowStress <= 0) errs.allowStress = "Введите положительное число";
    if (!inputs.weldCoeff || isNaN(+inputs.weldCoeff) || +inputs.weldCoeff <= 0 || +inputs.weldCoeff > 1) errs.weldCoeff = "От 0 до 1";
    if (!inputs.addAllowance || isNaN(+inputs.addAllowance)) errs.addAllowance = "Введите число";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCalc = () => {
    if (!validate()) return;
    setResult(calculate(inputs));
  };

  const fields: { key: keyof Inputs; label: string; unit: string; hint: string; placeholder: string }[] = [
    { key: "pressure",     label: "Рабочее давление",              unit: "МПа",  hint: "Максимальное рабочее давление",          placeholder: "1.6" },
    { key: "diameter",     label: "Внутренний диаметр трубопровода", unit: "мм",   hint: "Номинальный внутренний диаметр",          placeholder: "200" },
    { key: "allowStress",  label: "Допускаемое напряжение [σ]",     unit: "МПа",  hint: "По марке стали и температуре",           placeholder: "147" },
    { key: "weldCoeff",    label: "Коэффициент сварного шва φ",     unit: "",     hint: "1.0 — бесшовная; 0.9 — сварная",        placeholder: "1.0" },
    { key: "addAllowance", label: "Прибавка к расчётной толщине c", unit: "мм",   hint: "Коррозионная + технологическая",         placeholder: "1.0" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

      {/* Form */}
      <div className="xl:col-span-2 bg-white rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Минимальная толщина стенки</h2>
          <p className="text-xs text-muted-foreground mt-0.5">ГОСТ 32388-2013 · Трубопроводы технологические. Расчёт на прочность</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Steel presets */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Быстрый выбор марки стали</label>
            <div className="flex flex-wrap gap-2">
              {STEEL_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => set("allowStress", p.stress)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs border transition-colors",
                    inputs.allowStress === p.stress
                      ? "border-epb-blue bg-epb-blue-soft text-epb-blue font-medium"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
                <div className="relative">
                  <input
                    type="number" step="any" value={inputs[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={cn(
                      "w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground",
                      "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
                      f.unit ? "pr-16" : "pr-3",
                      errors[f.key] ? "border-destructive focus:ring-destructive" : "border-input"
                    )}
                  />
                  {f.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono pointer-events-none">
                      {f.unit}
                    </span>
                  )}
                </div>
                {errors[f.key]
                  ? <p className="text-xs text-destructive mt-1">{errors[f.key]}</p>
                  : <p className="text-xs text-muted-foreground mt-1">{f.hint}</p>
                }
              </div>
            ))}
          </div>

          <button
            onClick={handleCalc}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="Calculator" size={15} />
            Рассчитать толщину стенки
          </button>

          {/* Result */}
          {result && (
            <div className={cn(
              "rounded-lg border p-5 animate-fade-in space-y-4",
              result.verdict === "ok" ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
            )}>
              <div className={cn(
                "flex items-center gap-2 font-semibold text-sm",
                result.verdict === "ok" ? "text-green-800" : "text-amber-800"
              )}>
                <Icon
                  name={result.verdict === "ok" ? "CheckCircle2" : "AlertTriangle"}
                  fallback="Info" size={16}
                  className={result.verdict === "ok" ? "text-green-600" : "text-amber-600"}
                />
                Результат расчёта по ГОСТ 32388-2013
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Расчётная толщина sₚ", value: result.calcThickness.toFixed(2), unit: "мм" },
                  { label: "С прибавкой (s + c)", value: result.minThickness.toFixed(2), unit: "мм" },
                  { label: "Принятая толщина", value: result.roundedThickness.toFixed(1), unit: "мм", highlight: true },
                  { label: "Коэфф. нагрузки", value: (result.actualRatio * 100).toFixed(1), unit: "%" },
                ].map((s, i) => (
                  <div key={i} className={cn(
                    "rounded-md p-3 text-center border",
                    s.highlight ? "bg-primary border-primary/20" : "bg-white/70 border-white/50"
                  )}>
                    <div className={cn("text-xl font-bold", s.highlight ? "text-primary-foreground" : "text-foreground")}>
                      {s.value}
                    </div>
                    <div className={cn("text-xs", s.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>{s.unit}</div>
                    <div className={cn("text-xs mt-1 leading-tight", s.highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/70 rounded-md p-3 border border-white/50">
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  s<sub>p</sub> = P·D / (2·[σ]·φ − P) = {inputs.pressure}·{inputs.diameter} / (2·{inputs.allowStress}·{inputs.weldCoeff} − {inputs.pressure}) = <strong className="text-foreground">{result.calcThickness.toFixed(3)} мм</strong>
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  s = s<sub>p</sub> + c = {result.calcThickness.toFixed(3)} + {inputs.addAllowance} = <strong className="text-foreground">{result.minThickness.toFixed(3)} мм</strong> → принято <strong className="text-foreground">{result.roundedThickness} мм</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: formula */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-border p-5">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Icon name="BookOpen" size={13} className="text-muted-foreground" />
            Формула (ГОСТ 32388)
          </h3>
          <div className="bg-muted/40 rounded-md p-4 font-mono text-sm text-center space-y-1">
            <div className="text-foreground font-semibold">s<sub>p</sub> = P · D</div>
            <div className="text-muted-foreground text-xs">──────────────</div>
            <div className="text-foreground font-semibold">2 · [σ] · φ − P</div>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            {[
              ["P",   "рабочее давление, МПа"],
              ["D",   "внутренний диаметр, мм"],
              ["[σ]", "допускаемое напряжение, МПа"],
              ["φ",   "коэффициент сварного шва"],
              ["c",   "суммарная прибавка, мм"],
            ].map(([sym, def]) => (
              <div key={sym} className="flex gap-2">
                <span className="font-mono font-medium text-foreground w-8 shrink-0">{sym}</span>
                <span>— {def}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-5">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Icon name="Info" size={13} className="text-muted-foreground" />
            Коэффициент сварного шва
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            {[
              ["1.0", "Бесшовные трубы"],
              ["1.0", "Стыковой шов, 100% контроль"],
              ["0.9", "Стыковой шов, частичный контроль"],
              ["0.8", "Угловой шов"],
            ].map(([v, d]) => (
              <div key={v + d} className="flex justify-between">
                <span>{d}</span>
                <span className="font-mono font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
