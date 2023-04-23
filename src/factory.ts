import { merge } from "lodash";
import type { PartialDeep } from "type-fest";
import { Builder } from "./interfaces";

export class Factory<T> implements Builder<T> {
  constructor(private readonly defaultAttributesFactory: () => T) {}

  build(override?: PartialDeep<T>): T {
    return merge(this.defaultAttributesFactory(), override);
  }
}
