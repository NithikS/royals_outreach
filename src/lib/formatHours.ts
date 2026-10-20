// Formats an hour count with its unit, dropping trailing zeros and adding
// thousands separators, e.g.:
//   formatHours(3)       -> "3 hrs"
//   formatHours(1)       -> "1 hr"
//   formatHours(2.5)     -> "2.5 hrs"
//   formatHours(1820)    -> "1,820 hrs"
//   formatHours(18, 25)  -> "18 / 25 hrs"
function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formatHours(hours: number, goal?: number): string {
  if (goal !== undefined) {
    return `${formatNumber(hours)} / ${formatNumber(goal)} hrs`;
  }

  return `${formatNumber(hours)} ${hours === 1 ? "hr" : "hrs"}`;
}
