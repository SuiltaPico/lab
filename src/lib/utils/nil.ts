export type Nil = undefined | null;

export function isNil(it: any): it is Nil {
  return it === undefined || it === null;
}

export function ifNotNil<T, U, V>(
  it: T,
  _ifNotNil: (it: Exclude<T, Nil>) => U,
  ifNil?: (it: Exclude<Nil, Exclude<Nil, T>>) => V,
) {
  if (isNil(it)) return ifNil?.(it as any);
  return _ifNotNil(it as any);
}

export function strNil<T extends { toString(): string }>(
  it: T | Nil,
  _ifNotNil: (it: string) => string,
  _default = "",
) {
  if (isNil(it)) return _default;
  if (typeof it !== "string") {
    it = it.toString() as any;
  }
  return _ifNotNil(it as any);
}
