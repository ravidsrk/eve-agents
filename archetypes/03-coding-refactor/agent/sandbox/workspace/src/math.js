// Small math utilities. NOTE: factorial has a bug.
export function add(a, b) {
  return a + b;
}

export function factorial(n) {
  // BUG: starts the accumulator at 0, so every result is 0.
  let result = 0;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}
