export const minMax = (number: number, min: number, max: number) => {
  return Math.min(Math.max(min, number), max);
}