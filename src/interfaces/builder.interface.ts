import { PartialDeep } from 'type-fest';
import { AdditionalParams } from './default-attributes-factory.interface';

export interface Builder<T, P = unknown> {
  build(partial?: PartialDeep<T>, params?: AdditionalParams<P>): T;
}

export interface BuilderMany<T, P = unknown> {
  buildMany(
    count: number,
    partials?: PartialDeep<T>[] | PartialDeep<T>,
    params?: AdditionalParams<P>,
  ): T[];
}
