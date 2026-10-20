// Whole-number percent of a goal, 0 when there is no goal, e.g. percent(94, 148) -> 64
export function percent(value: number, goal: number): number {
  return goal > 0 ? Math.round((value / goal) * 100) : 0;
}
