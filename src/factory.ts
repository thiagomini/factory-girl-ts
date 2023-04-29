import { merge } from 'lodash';
import type { PartialDeep } from 'type-fest';
import { Association } from './association';
import {
  Associator,
  Builder,
  BuilderMany,
  DefaultAttributesFactory,
} from './interfaces';
import { Dictionary } from './types';

export class Factory<T extends Dictionary, P extends Dictionary>
  implements Builder<T, P>, Associator<T>, BuilderMany<T>
{
  constructor(
    private readonly defaultAttributesFactory: DefaultAttributesFactory<T, P>,
  ) {}

  associate<K extends keyof T>(key?: K | undefined): Association<T> {
    return new Association(this, key);
  }

  build(override?: PartialDeep<T>, additionalParams?: P): T {
    const associations = this.resolveAssociations(additionalParams);
    return merge(associations, override);
  }

  buildMany(
    count: number,
    partials?: PartialDeep<T>[] | PartialDeep<T>,
    additionalParams?: P,
  ): T[] {
    if (Array.isArray(partials)) {
      return Array.from({ length: count }).map((_, index: number) =>
        this.build(partials?.[index]),
      );
    }

    return Array.from({ length: count }).map(() =>
      this.build(partials, additionalParams),
    );
  }

  private resolveAssociations(additionalParams?: P): T {
    const attributes = this.defaultAttributesFactory({
      transientParams: additionalParams,
    });
    const defaultWithAssociations: Dictionary = {};

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
