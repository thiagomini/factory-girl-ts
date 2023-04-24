import { Builder } from "./interfaces";

type ValueOrObject<T, K extends keyof T | undefined> = K extends keyof T
  ? T[K]
  : T;

export class Association<T> {
  constructor(private readonly builder: Builder<T>) {}

  build<K extends keyof T | undefined = undefined>(
    key?: K
  ): ValueOrObject<T, K> {
    const built = this.builder.build();

    if (key) {
      return built[key] as ValueOrObject<T, K>;
    }

    return built as ValueOrObject<T, K>;
  }
}
