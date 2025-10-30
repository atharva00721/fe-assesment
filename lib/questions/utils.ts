export function capitalizeWords(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function parseIdFromUrl(url: string): string {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? match[1] : '';
}

export async function pMap<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length) as unknown as R[];
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, Math.max(1, items.length)) }, async () => {
    while (true) {
      const current = index++;
      if (current >= items.length) break;
      results[current] = await mapper(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}


