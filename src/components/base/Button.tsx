import { JSX } from "solid-js";
import { combindProps } from "../../lib/utils/jsx";
import { PropOf } from "../interfaces";
import tailwindcssConfig from "../../lib/meta/tailwind.config.js";
import "./Button.css";
import { strNil } from "../../lib/utils/nil.js";

console.log(tailwindcssConfig);

export default function Button(
  props: Omit<PropOf<HTMLButtonElement>, "style"> & {
    gap?: number | string;
    style?: JSX.CSSProperties;
  },
) {
  return <button {...combindProps(props, "btn", {})}></button>;
}

export function PrimaryButton(
  props: Omit<PropOf<HTMLButtonElement>, "style"> & {
    gap?: number | string;
    style?: JSX.CSSProperties;
    thin?: boolean;
  },
) {
  return (
    <button
      {...combindProps(
        props,
        "btn primary" + strNil(props.thin, () => " thin"),
        {},
      )}
    ></button>
  );
}

export function SecondlyButton(
  props: Omit<PropOf<HTMLButtonElement>, "style"> & {
    gap?: number | string;
    style?: JSX.CSSProperties;
    thin?: boolean;
  },
) {
  return (
    <button
      {...combindProps(
        props,
        "btn secondly" + strNil(props.thin, () => " thin"),
        {},
      )}
    ></button>
  );
}
