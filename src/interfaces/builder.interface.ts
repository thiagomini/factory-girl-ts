import { PartialDeep } from 'type-fest';

export interface Builder<T> {
  build(partial?: PartialDeep<T>): T;
}

export interface BuilderMany<T> {
  buildMany(count: number, partials?: PartialDeep<T>[] | PartialDeep<T>): T[];
}
