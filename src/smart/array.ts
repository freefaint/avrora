export const unique = <T>(arr: T[]) => {
  var collection: T[] = [];

  arr.forEach((i) => !collection.includes(i) && collection.push(i));

  return collection;
};

export const repeats = <T extends string>(arr: T[]) => {
  const total: Record<string, number> = {};

  arr.forEach((i) => (total[i] = total[i] !== undefined ? total[i] + 1 : 0));

  return total;
};
