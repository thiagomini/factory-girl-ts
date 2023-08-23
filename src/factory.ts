import { merge, times } from 'lodash';
import type { PartialDeep } from 'type-fest';
import { ModelAdapter } from './adapters/adapter.interface';
import { Association } from './association';
import {
  AdditionalParams,
  AfterCreateHook,
  DefaultAttributesFactory,
} from './interfaces';
import { Dictionary } from './types';
import { InstanceOrInterface } from './types/instance-or-interface.type';

export class Factory<Model, Attributes, Params, ReturnType = Attributes> {
  constructor(
    private readonly defaultAttributesFactory: DefaultAttributesFactory<
      Attributes,
      Params
    >,
    private readonly model: Model,
    private readonly _adapter: () => ModelAdapter<Model, ReturnType>,
    private readonly afterCreateHooks: AfterCreateHook<ReturnType>[] = [],
  ) {}

  public get adapter() {
    return this._adapter();
  }

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
    const built = this.adapter.build(
      this.model,
      finalAttributes as PartialDeep<InstanceOrInterface<Model>>,
    );

    const createdModel = await this.adapter.save(built, this.model);
    return await this.resolveHooks(createdModel);
  }

  async createMany(
    count: number,
    partials?: PartialDeep<Attributes>[] | PartialDeep<Attributes>,
    additionalParams?: Params,
  ): Promise<ReturnType[]> {
    return await Promise.all(
      times(count).map((_partial, index) => {
        return this.create(
          Array.isArray(partials) ? partials?.[index] : partials,
          additionalParams,
        );
      }),
    );
  }

  build(
    override?: PartialDeep<Attributes>,
    additionalParams?: Params,
  ): ReturnType {
    let mergedAttributes = override;

    const attributesWithAssociations =
      this.resolveAssociations(additionalParams);

    mergedAttributes = merge(attributesWithAssociations, override);

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
      this._adapter,
    );
  }

  afterCreate(
    afterCreateHook: AfterCreateHook<ReturnType>,
  ): Factory<Model, Attributes, Params, ReturnType> {
    return new Factory(
      this.defaultAttributesFactory,
      this.model,
      this._adapter,
      [...this.afterCreateHooks, afterCreateHook],
    );
  }

  mutate<NewType>(callback: (model: Model) => NewType | Promise<NewType>) {
    const newHook = async (model: Model) => {
      const newModel = await callback(model);
      return newModel;
    };

    return new Factory<Model, Attributes, Params, NewType>(
      this.defaultAttributesFactory,
      this.model,
      this._adapter as any,
      [...this.afterCreateHooks, newHook as any],
    );
  }

  private async resolveHooks(returnedObject: ReturnType): Promise<ReturnType> {
    for (const hook of this.afterCreateHooks) {
      returnedObject = await hook(returnedObject);
    }

    return returnedObject;
  }

  private resolveAssociations(additionalParams?: Params): Attributes {
    const attributes = this.defaultAttributesFactory({
      transientParams: additionalParams,
    });
    const defaultWithAssociations: Dictionary = {};

    for (const prop in attributes as Dictionary) {
      const value = attributes[prop as keyof typeof attributes];
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

    for (const prop in attributes as Dictionary) {
      const value = attributes[prop as keyof typeof attributes];
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
