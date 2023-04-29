import { ModelAdapter } from '@src/adapters/adapter.interface';
import { ObjectAdapter } from '@src/adapters/object.adapter';
import { Dictionary } from '@src/types';
import { Factory } from './factory';
import { DefaultAttributesFactory } from './interfaces';

export class FactoryGirl {
  static define<
    Attributes extends Dictionary,
    Parameters extends Dictionary = Dictionary,
    ReturnType = Attributes,
  >(
    model: ReturnType,
    defaultAttributesFactory: DefaultAttributesFactory<Attributes, Parameters>,
    adapter?: ModelAdapter<ReturnType>,
  ): Factory<Attributes, Parameters, ReturnType> {
    adapter ??= new ObjectAdapter<ReturnType>();
    return new Factory(defaultAttributesFactory, model, adapter);
  }
}
