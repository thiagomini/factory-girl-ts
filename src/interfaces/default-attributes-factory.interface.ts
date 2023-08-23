import { Association } from '../association';

export type AdditionalParams<Transient> = {
  transientParams?: Transient;
};

export type DefaultAttributesFactory<T, P> = (params: AdditionalParams<P>) => (
  | T
  | {
      [K in keyof T]?: T[K] | Association<T[K]>;
    }
) & {
  [key: string]: unknown;
};
