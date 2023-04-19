export interface Builder<T> {
  build(partial: Partial<T>): T;
}

export interface Creator<T> {
  create(partial: Partial<T>): Promise<T>;
}

export type Factory<T> = Builder<T> & Creator<T> & {};
