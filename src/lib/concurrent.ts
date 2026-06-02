export interface ProgressInfo {
  completed: number;
  total: number;
  errors: Error[];
}

export async function parallelWithLimit<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<unknown>,
  limit: number = 3,
  onProgress?: (info: ProgressInfo) => void
): Promise<ProgressInfo> {
  if (items.length === 0) {
    const info: ProgressInfo = { completed: 0, total: 0, errors: [] };
    onProgress?.(info);
    return info;
  }

  let completed = 0;
  const errors: Error[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      const item = items[currentIndex];
      try {
        await fn(item, currentIndex);
      } catch (err) {
        errors.push(err instanceof Error ? err : new Error(String(err)));
      }
      completed++;
      onProgress?.({ completed, total: items.length, errors: [...errors] });
    }
  }

  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return { completed, total: items.length, errors };
}
