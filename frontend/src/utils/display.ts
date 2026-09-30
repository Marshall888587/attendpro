const TAG_PALETTE = [
  "bg-indigo-50 text-indigo-700",
  "bg-teal-50 text-teal-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-sky-50 text-sky-700",
  "bg-violet-50 text-violet-700",
];

export function tagColorClass(seed: number | string | undefined | null): string {
  if (seed == null) return TAG_PALETTE[0];
  const key = typeof seed === "number" ? seed : seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return TAG_PALETTE[key % TAG_PALETTE.length];
}

export function initials(a?: string | null, b?: string | null): string {
  return `${a?.[0] ?? ""}${b?.[0] ?? ""}`.toUpperCase() || "?";
}
