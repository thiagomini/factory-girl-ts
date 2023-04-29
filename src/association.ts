import { ModelAdapter } from '@src/adapters/adapter.interface';
import { Dictionary } from '@src/types';
import { ValueOf } from 'type-fest';
import { Builder } from './interfaces';
export class Association<T, P = Dictionary, ReturnType = T> {
  constructor(
    private readonly builder: Builder<T, P, ReturnType>,
    private readonly adapter: ModelAdapter<ReturnType>,
    private readonly key?: keyof ReturnType,
  ) {}

  build(): ReturnType | ValueOf<ReturnType> {
    const built = this.builder.build();

    if (this.key) {
      return this.adapter.get(built, this.key);
    }

    return built;
  }
}
