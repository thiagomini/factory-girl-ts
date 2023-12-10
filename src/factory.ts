/* eslint-disable @typescript-eslint/no-explicit-any */
import { isObject, times } from 'lodash';
import type { PartialDeep } from 'type-fest';
import { ModelAdapter } from './adapters/adapter.interface';
import { Association, isAssociation } from './association';
import {
  AdditionalParams,
  AfterBuildHook,
  AfterCreateHook,
  DefaultAttributesFactory,
} from './interfaces';
import { Dictionary, NonFunctionProperties } from './types';
import { InstanceOrInterface } from './types/instance-or-interface.type';
import { mergeDeep } from './utils';

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
  associate<K extends keyof ReturnType>(k?: K): Association<any, any, any, any>;
  /**
   * Creates an association with the current factory. You can optionally override the default attributes.
   * @param override The attributes that override the default factory attributes.
   */
  associate<O extends Override<Attributes, ReturnType>>(
    override: O,
  ): Association<Model, Attributes, Params, ReturnType>;
  /**
   * Creates an association with the current factory. You can optionally override the default attributes and
   * transient parameters
   * @param override The attributes that override the default factory attributes.
   * @param transientParams The factory transient parameters.
   */
  associate<O extends Override<Attributes, ReturnType>>(
    override: O,
    transientParams: Params,
  ): Association<Model, Attributes, Params, ReturnType>;
  /**
   * Creates an association with the current factory. You can optionally override the default attributes.
   * @param key The key of this model to be returned when the association is resolved.
   * @param override The attributes that override the default factory attributes.
   */
  associate<
    K extends keyof ReturnType,
    O extends Override<Attributes, ReturnType>,
  >(key: K, override: O): Association<any, any, any, any>;

  associate<
    K extends keyof ReturnType,
    O extends Override<Attributes, ReturnType>,
  >(
    keyOrOverride?: K | Override<Attributes, ReturnType>,
    overrideOrTransientParams?: O | Params,
  ): Association<Model, Attributes, Params, ReturnType> {
    const isAssociationAttribute = isObject(keyOrOverride);

    return new Association<Model, Attributes, Params, ReturnType>(
      this,
      this.adapter,
      isAssociationAttribute ? keyOrOverride : (overrideOrTransientParams as O),
      isAssociationAttribute ? undefined : (keyOrOverride as K),
      overrideOrTransientParams as Params,
    );
  }

  /**
   * Creates an association with the current factory that should create multiple models.
   * @param count The number of models to create.
   * @param override The attributes that override the default factory attributes.
   * @param transientParams The factory transient parameters.
   * @returns An association object that can be used to build or create the associated models.
   */
  associateMany<O extends Override<Attributes, ReturnType>>(
    count: number,
    override?: O,
    transientParams?: Params,
  ): Association<any> {
    return new Association<Model, Attributes, Params, ReturnType>(
      this,
      this.adapter,
      override,
      undefined,
      transientParams,
    ).withCount(count);
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

    const finalAttributes = mergeDeep<Attributes>(
      defaultAttributesWithAssociations,
      override as Attributes,
    );
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

    mergedAttributes = mergeDeep<Override<Attributes, ReturnType>>(
      attributesWithAssociations as Override<Attributes, ReturnType>,
      override,
    );

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
      const defaultAttributes =
        await this.defaultAttributesFactory(additionalParams);

      return mergeDeep<Override<Attributes, ReturnType>>(
        defaultAttributes as Override<Attributes, ReturnType>,
        (await newDefaultAttributesFactory(additionalParams)) as Override<
          Attributes,
          ReturnType
        >,
      );
    };
    return new Factory(
      decoratedDefaultAttributesFactory,
      this.model,
      this._adapter,
    );
  }

  /**
   * Extends the current factory passing specific transient parameters. This is useful if you have a factory
   * with transient parameters that defines the type of returned model, and you want to easily create variants of it.
   * @param newParams The new transient parameters.
   * @returns A new factory with the extended transient parameters.
   * @example
   * const userWithRolesFactory = userFactory.extend<{ roles: string[] }>(({ transientParams }) => {
   *  return {
   *    roles: transientParams.roles ?? [],
   *  }
   * })
   *
   * const userWithAdminRoleFactory = userWithRolesFactory.extendParams({ roles: ['admin'] });
   * const userWithAdminRole = await userWithAdminRoleFactory.build();
   * // userWithAdminRole.roles === ['admin']
   */
  extendParams<ExtendedParams extends Params = Params>(
    newParams: ExtendedParams,
  ): Factory<Model, Attributes, ExtendedParams, ReturnType> {
    const newDefaultAttributesFactory = async () => {
      return await this.defaultAttributesFactory({
        transientParams: newParams,
      });
    };
    return new Factory(
      newDefaultAttributesFactory,
      this.model,
      this._adapter,
      this.afterCreateHooks,
      this.afterBuildHooks,
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
        defaultWithAssociations[prop] = await value.resolve(associationType);
      } else {
        defaultWithAssociations[prop] = value;
      }
    }

    return defaultWithAssociations as Attributes;
  }
}
