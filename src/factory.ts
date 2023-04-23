import { merge } from "lodash";
import type { PartialDeep } from "type-fest";
import { Associate, Associator, Builder } from "./interfaces";

export class Factory<T> implements Builder<T>, Associator<T> {
  constructor(private readonly defaultAttributesFactory: () => T) {}

  associate<K extends keyof T>(keyOrType?: K | undefined): Associate<T, K> {
    const associatedType = this.defaultAttributesFactory();

    if (keyOrType) {
      return () => associatedType[keyOrType];
    }

    return () => associatedType;
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
        defaultWithAssociations[prop] = value();
      } else {
        defaultWithAssociations[prop] = value;
      }
    }

    return defaultWithAssociations as T;
  }
}

function isAssociation<T>(
  value: T | Associate<T, keyof T>
): value is Associate<T, keyof T> {
  return typeof value === "function";
}
