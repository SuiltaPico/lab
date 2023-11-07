import { JSX, ParentComponent } from "solid-js";
export type PropOf<T> = Parameters<ParentComponent<JSX.HTMLAttributes<T>>>[0];
export type DivProp = PropOf<HTMLDivElement>;
