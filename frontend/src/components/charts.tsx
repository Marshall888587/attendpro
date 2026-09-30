interface BarDatum {
  label: string;
  value: number;
}

export function SimpleBarChart({ data, max = 100 }: { data: BarDatum[]; max?: number }) {
  if (data.length === 0) return <p className="text-sm text-slate-400">Aucune donnée disponible.</p>;

  return (
    <div className="flex h-48 items-end gap-4">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-medium text-slate-500">{d.value}%</span>
          <div
            className="w-full rounded-t-md bg-primary-700"
            style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
          />
          <span className="text-xs text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function SimpleAreaChart({ points }: { points: number[] }) {
  if (points.length === 0) return <p className="text-sm text-slate-400">Aucune donnée disponible.</p>;

  const width = 600;
  const height = 180;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const stepX = width / (points.length - 1 || 1);

  const coords = points.map((p, i) => [i * stepX, height - ((p - min) / range) * height] as const);
  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <path d={areaPath} fill="url(#areaGradient)" />
      <path d={linePath} fill="none" stroke="#182a56" strokeWidth={2.5} />
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#182a56" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#182a56" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
