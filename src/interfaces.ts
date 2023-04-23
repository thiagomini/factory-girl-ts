export interface Builder<T> {
  build(partial: Partial<T>): T;
}

export interface Creator<T> {
  create(partial: Partial<T>): Promise<T>;
}

export class Factory<T> implements Builder<T> {
  constructor(private readonly defaultAttributesFactory: () => T) {}

  build(): T {
    return this.defaultAttributesFactory();
  }
}
