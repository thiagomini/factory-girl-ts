import { PartialDeep } from "type-fest";

export interface Builder<T> {
  build(partial?: PartialDeep<T>): T;
}
