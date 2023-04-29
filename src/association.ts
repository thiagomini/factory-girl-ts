import { ValueOf } from 'type-fest';
import { Builder } from './interfaces';
export class Association<T> {
  constructor(
    private readonly builder: Builder<T>,
    private readonly key?: keyof T,
  ) {}

  build(): T | ValueOf<T> {
    const built = this.builder.build();

    if (this.key) {
      return built[this.key];
    }

    return built;
  }
}
