import { Builder } from "./interfaces";

export class Association<T> {
  constructor(private readonly builder: Builder<T>) {}

  build(): T {
    return this.builder.build();
  }
}
