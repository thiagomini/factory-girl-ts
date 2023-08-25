/* eslint-disable @typescript-eslint/no-explicit-any */
import { merge, times } from 'lodash';
import type { PartialDeep } from 'type-fest';
import { ModelAdapter } from './adapters/adapter.interface';
import { Association } from './association';
import {
  AdditionalParams,
  AfterBuildHook,
  AfterCreateHook,
  DefaultAttributesFactory,
} from './interfaces';
import { Dictionary, NonFunctionProperties } from './types';
import { InstanceOrInterface } from './types/instance-or-interface.type';

export type Override<Attributes, ReturnType> =
  | PartialDeep<NonFunctionProperties<Attributes>>
  | PartialDeep<NonFunctionProperties<ReturnType>>;

export class Factory<Model, Attributes, Params, ReturnType = Attributes> {
  constructor(
    private readonly defaultAttributesFactory: DefaultAttributesFactory<
      Attributes,
      Params
    >,
    private readonly model: Model,
    private readonly _adapter: () => ModelAdapter<Model, ReturnType>,
    private readonly afterCreateHooks: AfterCreateHook<ReturnType>[] = [],
    private readonly afterBuildHooks: AfterBuildHook<ReturnType>[] = [],
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
    override?: Override<Attributes, ReturnType>,
    additionalParams?: Params,
  ): Promise<ReturnType> {
    const defaultAttributesWithAssociations = await this.resolveAssociations(
      'create',
      additionalParams,
    );

    const finalAttributes = merge(defaultAttributesWithAssociations, override);
    const built = this.adapter.build(
      this.model,
      finalAttributes as PartialDeep<InstanceOrInterface<Model>>,
    );

    const createdModel = await this.adapter.save(built, this.model);
    return await this.resolveCreateHooks(createdModel);
  }

  async createMany(
    count: number,
    partials?:
      | Override<Attributes, ReturnType>[]
      | Override<Attributes, ReturnType>,
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

  async build(
    override?: Override<Attributes, ReturnType>,
    additionalParams?: Params,
  ): Promise<ReturnType> {
    let mergedAttributes = override;

    const attributesWithAssociations = await this.resolveAssociations(
      'build',
      additionalParams,
    );

    mergedAttributes = merge(attributesWithAssociations, override);

    const finalResult = this.adapter.build(
      this.model,
      mergedAttributes as PartialDeep<InstanceOrInterface<Model>>,
    );

    return await this.resolveBuildHooks(finalResult);
  }

  async buildMany(
    count: number,
    partials?:
      | Override<Attributes, ReturnType>[]
      | Override<Attributes, ReturnType>,
    additionalParams?: Params,
  ): Promise<ReturnType[]> {
    if (Array.isArray(partials)) {
      const buildPromises = times(count).map((_partial, index: number) =>
        this.build(partials?.[index], additionalParams),
      );
      return await Promise.all(buildPromises);
    }

    return await Promise.all(
      times(count).map(() => this.build(partials, additionalParams)),
    );
  }

  extend<ExtendedParams extends Params = Params>(
    newDefaultAttributesFactory: DefaultAttributesFactory<
      Attributes,
      ExtendedParams
    >,
  ): Factory<Model, Attributes, ExtendedParams, ReturnType> {
    const decoratedDefaultAttributesFactory = async (
      additionalParams: AdditionalParams<ExtendedParams>,
    ) => {
      const defaultAttributes = await this.defaultAttributesFactory(
        additionalParams,
      );
      return merge(
        defaultAttributes,
        await newDefaultAttributesFactory(additionalParams),
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

  afterBuild(
    afterBuildHook: AfterBuildHook<ReturnType>,
  ): Factory<Model, Attributes, Params, ReturnType> {
    return new Factory(
      this.defaultAttributesFactory,
      this.model,
      this._adapter,
      this.afterCreateHooks,
      [...this.afterBuildHooks, afterBuildHook],
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

  private async resolveCreateHooks(
    returnedObject: ReturnType,
  ): Promise<ReturnType> {
    for (const hook of this.afterCreateHooks) {
      returnedObject = await hook(
        returnedObject,
        this.adapter as unknown as ModelAdapter<ReturnType, ReturnType>,
      );
    }

    return returnedObject;
  }

  private async resolveBuildHooks(
    returnedObject: ReturnType,
  ): Promise<ReturnType> {
    for (const hook of this.afterBuildHooks) {
      returnedObject = await hook(returnedObject);
    }

    return returnedObject;
  }

  private async resolveAssociations(
    associationType: 'build' | 'create',
    additionalParams?: Params,
  ): Promise<Attributes> {
    const attributes = await this.defaultAttributesFactory({
      transientParams: additionalParams,
    });
    const defaultWithAssociations: Dictionary = {};

    for (const prop in attributes as Dictionary) {
      const value = attributes[prop as keyof typeof attributes];
      if (isAssociation(value)) {
        defaultWithAssociations[prop] = await value[associationType]();
      } else {
        defaultWithAssociations[prop] = value;
      }
    }

    return defaultWithAssociations as Attributes;
  }
}

function isAssociation<T>(
  value: T | Association<T> | unknown,
): value is Association<T> {
  return value instanceof Association;
}
