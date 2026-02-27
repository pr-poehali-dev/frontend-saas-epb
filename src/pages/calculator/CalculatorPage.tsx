import { useState } from "react";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import ResidualLifeCalc from "./ResidualLifeCalc";
import WallThicknessCalc from "./WallThicknessCalc";

type CalcTab = "residual" | "wall" | "corrosion";

const TABS: { key: CalcTab; label: string; icon: string; desc: string; gost: string }[] = [
  {
    key: "residual",
    label: "Остаточный ресурс",
    icon: "Timer",
    desc: "Оценка остаточного ресурса трубопровода по скорости коррозии",
    gost: "РД 09-539-03",
  },
  {
    key: "wall",
    label: "Расчёт на прочность",
    icon: "Layers",
    desc: "Минимальная допустимая толщина стенки трубопровода под давлением",
    gost: "ГОСТ 32388-2013",
  },
  {
    key: "corrosion",
    label: "Скорость коррозии",
    icon: "TrendingDown",
    desc: "Расчёт скорости коррозии по результатам замеров толщинометрии",
    gost: "РД 03-421-01",
  },
];

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<CalcTab>("residual");

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Tab cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "text-left p-4 rounded-lg border transition-all",
              activeTab === tab.key
                ? "border-epb-blue bg-epb-blue-soft shadow-sm"
                : "border-border bg-white hover:bg-muted/30"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                activeTab === tab.key ? "bg-epb-blue text-white" : "bg-muted text-muted-foreground"
              )}>
                <Icon name={tab.icon} fallback="Calculator" size={15} />
              </div>
              {activeTab === tab.key && <Icon name="CheckCircle2" size={15} className="text-epb-blue shrink-0 mt-0.5" />}
            </div>
            <div className="mt-3">
              <div className={cn("text-sm font-semibold", activeTab === tab.key ? "text-epb-blue" : "text-foreground")}>
                {tab.label}
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{tab.desc}</div>
              <div className="mt-2 inline-block px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-muted-foreground">
                {tab.gost}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Active calculator */}
      {activeTab === "residual"  && <ResidualLifeCalc />}
      {activeTab === "wall"      && <WallThicknessCalc />}
      {activeTab === "corrosion" && <CorrosionRateCalc />}
    </div>
  );
}

/* ── Corrosion rate (inline, simple) ── */
function CorrosionRateCalc() {
  const [rows, setRows] = useState([
    { year: "2021", thickness: "8.2" },
    { year: "2024", thickness: "7.1" },
  ]);
  const [result, setResult] = useState<{ rate: number; trend: string } | null>(null);

  const addRow = () => setRows(r => [...r, { year: "", thickness: "" }]);
  const updateRow = (i: number, key: "year" | "thickness", val: string) =>
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [key]: val } : row));
  const removeRow = (i: number) => setRows(r => r.filter((_, idx) => idx !== i));

  const calculate = () => {
    const valid = rows
      .map(r => ({ year: parseFloat(r.year), t: parseFloat(r.thickness) }))
      .filter(r => !isNaN(r.year) && !isNaN(r.t))
      .sort((a, b) => a.year - b.year);

    if (valid.length < 2) return;

    const first = valid[0], last = valid[valid.length - 1];
    const rate = (first.t - last.t) / (last.year - first.year);
    const trend = rate > 0.3 ? "Высокая (>0.3 мм/год)" : rate > 0.1 ? "Умеренная (0.1–0.3 мм/год)" : "Низкая (<0.1 мм/год)";
    setResult({ rate: Math.max(0, rate), trend });
  };

  return (
    <div className="bg-white rounded-lg border border-border">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Скорость коррозии по замерам УЗТ</h2>
          <p className="text-xs text-muted-foreground mt-0.5">РД 03-421-01 · Введите значения толщин по годам</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>Год замера</span><span>Толщина стенки, мм</span><span />
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <input
                type="number" value={row.year} onChange={e => updateRow(i, "year", e.target.value)}
                placeholder="2021"
                className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                type="number" step="0.1" value={row.thickness} onChange={e => updateRow(i, "thickness", e.target.value)}
                placeholder="8.2"
                className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button onClick={() => removeRow(i)} disabled={rows.length <= 2} className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 p-1">
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))}
          <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-epb-blue hover:underline mt-1">
            <Icon name="Plus" size={13} /> Добавить замер
          </button>
        </div>

        <button
          onClick={calculate}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Рассчитать скорость коррозии
        </button>

        {result && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-5 animate-fade-in space-y-3">
            <div className="flex items-center gap-2 text-green-800 font-semibold text-sm">
              <Icon name="CheckCircle2" size={16} className="text-green-600" /> Результат расчёта
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-md p-3 border border-green-100">
                <div className="text-xs text-muted-foreground">Скорость коррозии</div>
                <div className="text-2xl font-bold text-foreground mt-1">{result.rate.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">мм/год</div>
              </div>
              <div className="bg-white rounded-md p-3 border border-green-100">
                <div className="text-xs text-muted-foreground">Оценка интенсивности</div>
                <div className="text-sm font-semibold text-foreground mt-1 leading-snug">{result.trend}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
