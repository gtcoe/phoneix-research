export const MO: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function pd(s: string | null): Date | null {
  if (!s) return null;
  const p = s.split(" ");
  return new Date(parseInt(p[1], 10), MO[p[0]], 15);
}

export function pdFull(s: string): Date {
  const p = s.split(" ");
  return new Date(parseInt(p[2], 10), MO[p[0]], parseInt(p[1], 10));
}

export const TODAY = new Date(2026, 3, 22);
