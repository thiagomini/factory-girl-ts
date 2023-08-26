/* eslint-disable @typescript-eslint/no-explicit-any */
import { isObject, merge, times } from 'lodash';
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

export class Factory<Model, Attributes, Params = any, ReturnType = Model> {
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

  /**
   * Creates an association with the current factory. The model creation is postponed until
   * necessary - if you call `build` or `create` on the factory but override the association,
   * the association will not be created in the database.
   * @param key The key of this model to be returned when the association is resolved.
   * @returns An association object that can be used to build or create the associated model.
   */
  associate<K extends keyof ReturnType>(
    k?: K,
  ): Association<Model, Attributes, Params, ReturnType>;
  associate<O extends Override<Attributes, ReturnType>>(
    override: O,
  ): Association<Model, Attributes, Params, ReturnType>;
  associate<
    K extends keyof ReturnType,
    O extends Override<Attributes, ReturnType>,
  >(key: K, override: O): Association<any, any, any, any>;

  associate<
    K extends keyof ReturnType,
    O extends Override<Attributes, ReturnType>,
  >(
    key?: K | Override<Attributes, ReturnType>,
    override?: O,
  ): Association<Model, Attributes, Params, ReturnType> {
    const isAssociationAttribute = isObject(key);

    return new Association<Model, Attributes, Params, ReturnType>(
      this,
      this.adapter,
      isAssociationAttribute ? key : override,
      isAssociationAttribute ? undefined : (key as K),
    );
  }

  /**
   * Creates a model and saves it to the database. This is based on the default attributes and
   * can be overridden by passing in an object.
   * @param override An object that overrides the default attributes.
   * @param additionalParams Additional params that can be used in the default attributes factory.
   * @returns The created model.
   * @example
   * const userFactory = new Factory(User, () => ({ name: 'John', age: 20 }));
   *
   * const user = await userFactory.create({ name: 'Jane' });
   *
   * // user.name === 'Jane'
   */
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

  /**
   * Creates multiple models and saves them to the database
   * @param count Number of models to create
   * @param partials An array of partials that override the default attributes. Each partial will be used for one model. Alternatively,
   * if you provide an object, it will be used for all models.
   * @param additionalParams Additional params that can be used in the default attributes factory.
   * @returns An array of the created models.
   * @example
   * const userFactory = new Factory(User, () => ({ name: 'John', age: 20 }));
   * const users = await userFactory.createMany(2, [{ name: 'JohnChanged' }, { age: 21 }]);
   * // users[0] === { name: 'JohnChanged', age: 20 }
   * // users[1] === { name: 'John', age: 21 }
   */
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

  /**
   * Builds a model without saving it to the database.
   * @param override An object that overrides the default attributes.
   * @param additionalParams Additional params that can be used in the default attributes factory.
   * @returns The built model.
   * @example
   * const userFactory = new Factory(User, () => ({ name: 'John', age: 20 }));
   * const user = await userFactory.build({ name: 'Jane' });
   * // user.name === 'Jane'
   */
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

  /**
   * Builds multiple models without saving them to the database.
   * @param count Number of models to build
   * @param partials An array of partials that override the default attributes. Each partial will be used for one model.
   * @param additionalParams Additional params that can be used in the default attributes factory.
   * @returns An array of the built models.
   * @example
   * const userFactory = new Factory(User, () => ({ name: 'John', age: 20 }));
   * const users = await userFactory.buildMany(2, [{ name: 'JohnChanged' }, { age: 21 }]);
   * // users[0] === { name: 'JohnChanged', age: 20 }
   * // users[1] === { name: 'John', age: 21 }
   */
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

  /**
   * Extends the current factory with additional default attributes.
   * @param newDefaultAttributesFactory A function that returns the new default attributes.
   * @returns A new factory with the extended default attributes.
   * @example
   * const userFactory = new Factory(User, () => ({ name: 'John', age: 20 }));
   * const extendedUserFactory = userFactory.extend(() => ({ name: 'Jane' }));
   * const user = await extendedUserFactory.build();
   * // user.name === 'Jane'
   */
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

  /**
   * Adds a hook that is called after the model is created.
   * @param afterCreateHook A function that is called after the model is created.
   * @returns A new factory with the added hook.
   * @example
   * const userFactory = new Factory(User, () => ({ name: 'John', age: 20 }));
   * const extendedUserFactory = userFactory.afterCreate((user) => {
   *  user.name = 'Jane';
   *  return user;
   * });
   * const user = await extendedUserFactory.create();
   * // user.name === 'Jane'
   */
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

  /**
   * Adds a hook that is called after the model is built.
   * @param afterBuildHook A function that is called after the model is built.
   * @returns A new factory with the added hook.
   * @example
   * const userFactory = new Factory(User, () => ({ name: 'John', age: 20 }));
   * const extendedUserFactory = userFactory.afterBuild((user) => {
   *   user.name = 'Jane';
   *   return user;
   * });
   * const user = await extendedUserFactory.build();
   * // user.name === 'Jane'
   */
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

  /**
   * Mutates the model after it is created. This is useful if you want to change the model class or type.
   * @param callback A function that is called after the model is created.
   * @returns A new factory with the added hook.
   * @example
   * const userFactory = new Factory(User, () => ({ name: 'John', age: 20 }));
   * const employeeFactory = userFactory.mutate((user) => new Employee(user));
   *
   * const employee = await employeeFactory.create();
   *
   * // employee instanceof Employee === true
   */
  mutate<NewType>(
    callback: (model: InstanceOrInterface<Model>) => NewType | Promise<NewType>,
  ) {
    const newHook = async (model: InstanceOrInterface<Model>) => {
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
