import { ModelAdapter } from '@src/adapters/adapter.interface';
import { InstanceOrInterface } from '@src/types/instance-or-interface.type';
import { merge } from 'lodash';
import type { PartialDeep } from 'type-fest';
import { Association } from './association';
import { DefaultAttributesFactory } from './interfaces';
import { Dictionary } from './types';

export class Factory<
  Model,
  Attributes extends Dictionary,
  Params extends Dictionary,
  ReturnType = Attributes,
> {
  constructor(
    private readonly defaultAttributesFactory: DefaultAttributesFactory<
      Attributes,
      Params
    >,
    private readonly model: Model,
    private readonly adapter: ModelAdapter<Model, ReturnType>,
  ) {}

  associate<K extends keyof ReturnType>(
    key?: K | undefined,
  ): Association<Attributes, Params, ReturnType> {
    return new Association<Attributes, Params, ReturnType>(
      this,
      this.adapter,
      key,
    );
  }

  build(
    override?: PartialDeep<Attributes>,
    additionalParams?: Params,
  ): ReturnType {
    const attributesWithAssociations =
      this.resolveAssociations(additionalParams);

    const mergedAttributes = merge(attributesWithAssociations, override);

    const finalResult = this.adapter.build(
      this.model,
      mergedAttributes as PartialDeep<InstanceOrInterface<Model>>,
    );

    return finalResult;
  }

  buildMany(
    count: number,
    partials?: PartialDeep<Attributes>[] | PartialDeep<Attributes>,
    additionalParams?: Params,
  ): ReturnType[] {
    if (Array.isArray(partials)) {
      return Array.from({ length: count }).map((_, index: number) =>
        this.build(partials?.[index], additionalParams),
      );
    }

    return Array.from({ length: count }).map(() =>
      this.build(partials, additionalParams),
    );
  }

  private resolveAssociations(additionalParams?: Params): Attributes {
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

    return defaultWithAssociations as Attributes;
  }
}

function isAssociation<T>(value: T | Association<T>): value is Association<T> {
  return value instanceof Association;
}
