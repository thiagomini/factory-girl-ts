import { merge, times } from 'lodash';
import type { PartialDeep } from 'type-fest';
import { ModelAdapter } from './adapters/adapter.interface';
import { Association } from './association';
import { AdditionalParams, DefaultAttributesFactory } from './interfaces';
import { Dictionary } from './types';
import { InstanceOrInterface } from './types/instance-or-interface.type';

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
  ): Association<Model, Attributes, Params, ReturnType> {
    return new Association<Model, Attributes, Params, ReturnType>(
      this,
      this.adapter,
      key,
    );
  }

  async create(
    override?: PartialDeep<Attributes>,
    additionalParams?: Params,
  ): Promise<ReturnType> {
    const defaultAttributesWithAssociations =
      await this.resolveAssociationsAsync(additionalParams);

    const finalAttributes = merge(defaultAttributesWithAssociations, override);
    const built = this.build(finalAttributes, additionalParams);
    const createdModel = await this.adapter.save(built, this.model);
    return createdModel;
  }

  async createMany(
    count: number,
    partials?: PartialDeep<Attributes>[] | PartialDeep<Attributes>,
    additionalParams?: Params,
  ): Promise<ReturnType[]> {
    const builtModels = this.buildMany(count, partials, additionalParams);
    return await Promise.all(
      builtModels.map((model) => this.adapter.save(model, this.model)),
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
      return times(count).map((_partial, index: number) =>
        this.build(partials?.[index], additionalParams),
      );
    }

    return times(count).map(() => this.build(partials, additionalParams));
  }

  extend<ExtendedParams extends Params = Params>(
    newDefaultAttributesFactory: DefaultAttributesFactory<
      Attributes,
      ExtendedParams
    >,
  ): Factory<Model, Attributes, ExtendedParams, ReturnType> {
    const decoratedDefaultAttributesFactory = (
      additionalParams: AdditionalParams<ExtendedParams>,
    ) => {
      const defaultAttributes = this.defaultAttributesFactory(additionalParams);
      return merge(
        defaultAttributes,
        newDefaultAttributesFactory(additionalParams),
      );
    };
    return new Factory(
      decoratedDefaultAttributesFactory,
      this.model,
      this.adapter,
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

  private async resolveAssociationsAsync(additionalParams?: Params) {
    const attributes = this.defaultAttributesFactory({
      transientParams: additionalParams,
    });
    const defaultWithAssociations: Dictionary = {};

    for (const prop in attributes) {
      const value = attributes[prop];
      if (isAssociation(value)) {
        defaultWithAssociations[prop] = await value.create();
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
