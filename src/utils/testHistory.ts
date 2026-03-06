export interface TestResult {
  date: string; // ISO string
  earned: number;
  total: number;
  percentage: number;
}

const STORAGE_KEY = 'spelling-bee-history';

export function getTestHistory(): TestResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TestResult[];
  } catch {
    return [];
  }
}

export function saveTestResult(earned: number, total: number): void {
  const history = getTestHistory();
  history.push({
    date: new Date().toISOString(),
    earned,
    total,
    percentage: Math.round((earned / total) * 100),
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}
