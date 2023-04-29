import { Association } from '@src/association';

export type DefaultAttributesFactory<T> = () =>
  | T
  | {
      [K in keyof T]?: T[K] | Association<T[K]>;
    };
