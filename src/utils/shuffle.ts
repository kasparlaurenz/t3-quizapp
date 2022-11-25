export const shuffle = <T>(array: T[]): T[] => {
  const result = array.slice(); // copy the array
  for (let i = result.length - 1; i > 0; i--) {
    // find a random index from begining to i
    const idx = Math.floor(Math.random() * (i + 1));
    // swap value at idx with value at i
    const tmp: T = result[i]!;
    result[i] = result[idx]!;
    result[idx] = tmp;
  }
  return result;
};
