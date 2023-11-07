import { JSX } from "solid-js";
import { combindProps, propsToStyle } from "../../lib/utils/jsx";
import { toFloat } from "../../lib/utils/number";
import { DivProp } from "../interfaces";

export const Row = (
  props: Omit<DivProp, "style"> & {
    gap?: number | string;
    style?: JSX.CSSProperties;
  },
) => {
  return (
    <div
      {...combindProps(props, "flex", {
        ...propsToStyle(props.gap, "gap", (it) => `${toFloat(it) / 4}rem`),
      })}
    ></div>
  );
};

export const Column = (
  props: Omit<DivProp, "style"> & {
    gap?: number | string;
    style?: JSX.CSSProperties;
  },
) => {
  return (
    <div
      {...{
        ...combindProps(props, "flex flex-col", {
          ...propsToStyle(props.gap, "gap", (it) => `${toFloat(it) / 4}rem`),
        }),
      }}
    ></div>
  );
};
