import { merge } from "lodash";
import type { PartialDeep } from "type-fest";
import { Association } from "./association";
import { Associator, Builder, DefaultAttributesFactory } from "./interfaces";

export class Factory<T extends Record<string, unknown>>
  implements Builder<T>, Associator<T>
{
  constructor(
    private readonly defaultAttributesFactory: DefaultAttributesFactory<T>
  ) {}

  associate<K extends keyof T>(key?: K | undefined): Association<T> {
    return new Association(this, key);
  }

  build(override?: PartialDeep<T>): T {
    const associations = this.resolveAssociations();
    return merge(associations, override);
  }

  private resolveAssociations(): T {
    const attributes = this.defaultAttributesFactory();
    const defaultWithAssociations: Record<string, unknown> = {};

    for (const prop in attributes) {
      const value = attributes[prop];
      if (isAssociation(value)) {
        defaultWithAssociations[prop] = value.build();
      } else {
        defaultWithAssociations[prop] = value;
      }
    }

    return defaultWithAssociations as T;
  }
}

function isAssociation<T>(value: T | Association<T>): value is Association<T> {
  return value instanceof Association;
}
