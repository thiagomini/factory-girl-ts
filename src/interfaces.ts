import type { PartialDeep } from "type-fest";
export interface Builder<T> {
  build(partial?: PartialDeep<T>): T;
}

export interface Creator<T> {
  create(partial: Partial<T>): Promise<T>;
}
