export const unique = <T>(arr: T[]) => {
  var collection: T[] = [];

  arr.forEach(i => !collection.includes(i) && collection.push(i));

  return collection;
};
