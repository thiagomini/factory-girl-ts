import { ModelAdapter } from '@src/adapters/adapter.interface';
import { ObjectAdapter } from '@src/adapters/object.adapter';
import { Dictionary } from '@src/types';
import { InstanceOrInterface } from '@src/types/instance-or-interface.type';
import { Factory } from './factory';
import { DefaultAttributesFactory } from './interfaces';

export class FactoryGirl {
  static define<
    ModelOrInterface,
    Attributes extends Dictionary,
    Parameters extends Dictionary = Dictionary,
    ReturnType extends InstanceOrInterface<ModelOrInterface> = InstanceOrInterface<ModelOrInterface>,
  >(
    model: ModelOrInterface,
    defaultAttributesFactory: DefaultAttributesFactory<Attributes, Parameters>,
    adapter?: ModelAdapter<ModelOrInterface, ReturnType>,
  ): Factory<ModelOrInterface, Attributes, Parameters, ReturnType> {
    adapter =
      adapter ??
      (new ObjectAdapter<ModelOrInterface>() as unknown as ModelAdapter<
        ModelOrInterface,
        ReturnType
      >);

    return new Factory<ModelOrInterface, Attributes, Parameters, ReturnType>(
      defaultAttributesFactory,
      model,
      adapter ?? new ObjectAdapter<ModelOrInterface>(),
    );
  }
}
