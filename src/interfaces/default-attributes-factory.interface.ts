import { Associate } from "./associator.interface";

export type DefaultAttributesFactory<T> = () =>
  | T
  | {
      [K in keyof T]?: T[K] | Associate<T[K], keyof T[K]>;
    };
