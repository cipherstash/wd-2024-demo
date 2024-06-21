export function mapChunks<T, U>(
  array: T[],
  chunkSize: number,
  callback: (chunk: T[]) => U,
): U[] {
  return array.reduce<U[]>((acc, _, index, originalArray) => {
    if (index % chunkSize === 0) {
      const chunk = originalArray.slice(index, index + chunkSize);
      acc.push(callback(chunk));
    }
    return acc;
  }, []);
}
