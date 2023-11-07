import { JSX } from "solid-js";
import { isNil, Nil } from "./nil";

export function propsToStyle<T, U extends string>(
  it: T,
  name: U,
  notNil: (it: Exclude<T, Nil>) => string,
) {
  if (isNil(it)) {
    return {};
  } else {
    return {
      [name]: notNil(it as any),
    } as const;
  }
}

export function combindProps<
  T extends { class?: string; style?: JSX.CSSProperties },
>(props: T, pre_class: string, extends_style?: JSX.CSSProperties) {
  return {
    ...props,
    class: [pre_class, props.class ?? ""].join(" "),
    style: {
      ...(props.style ?? {}),
      ...(extends_style ?? {}),
    },
  };
}
