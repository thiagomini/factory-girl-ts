import type { PartialDeep } from "type-fest";
export interface Builder<T> {
  build(partial?: PartialDeep<T>): T;
}

export type Associate<T, K extends keyof T> = () => T | T[K];

export interface Associator<T> {
  associate<K extends keyof T>(keyOrType?: K): Associate<T, K>;
}

export interface Creator<T> {
  create(partial: Partial<T>): Promise<T>;
}
