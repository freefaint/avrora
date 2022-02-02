export const unique = <T>(arr: T[]) => {
  var collection: T[] = [];

  arr.forEach((i) => !collection.includes(i) && collection.push(i));

  return collection;
};

export const repeats = <T>(arr: T[]) => {
  const total: { value: T; repeats: number }[] = [];

  arr.forEach((i) => {
    const last = total[total.length - 1];

    if (!last || last.value !== i) {
      total.push({ value: i, repeats: 1 });
    } else {
      last.repeats++;
    }
  });

  return total;
};
