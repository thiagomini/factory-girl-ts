import { PartialDeep } from 'type-fest';
import { AdditionalParams } from './default-attributes-factory.interface';

export interface Builder<T, P = unknown, ReturnType = T> {
  build(partial?: PartialDeep<T>, params?: AdditionalParams<P>): ReturnType;
}

export interface BuilderMany<T, P = unknown, ReturnType = T> {
  buildMany(
    count: number,
    partials?: PartialDeep<T>[] | PartialDeep<T>,
    params?: AdditionalParams<P>,
  ): ReturnType[];
}
