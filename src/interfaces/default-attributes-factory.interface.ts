import { Association } from '../association';

export type AdditionalParams<Transient> = {
  transientParams?: Transient;
};

type DefaultAttributes<T> =
  | T
  | {
      [K in keyof T]?: T[K] | Association<T[K]>;
    };

export type DefaultAttributesFactory<T, P> = (
  params: AdditionalParams<P>,
) => DefaultAttributes<T> | Promise<DefaultAttributes<T>>;
