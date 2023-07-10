export function memoize<T, U>(fn: (arg: T) => U): (arg: T) => U {
  const cache = new Map<T, U>();

  return (arg: T): U => {
    const cached = cache.get(arg);
    if (cached) {
      return cached;
    }

    const val = fn(arg);
    cache.set(arg, val);
    return val;
  };
}
