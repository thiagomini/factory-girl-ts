import { ModelAdapter } from '@src/adapters/adapter.interface';
import { ObjectAdapter } from '@src/adapters/object.adapter';
import { Dictionary } from '@src/types';
import { InstanceOrInterface } from '@src/types/instance-or-interface.type';
import { Factory } from './factory';
import { DefaultAttributesFactory } from './interfaces';

export class FactoryGirl {
  static adapter: ModelAdapter<unknown, unknown> = new ObjectAdapter();

  static setAdapter(adapter: ModelAdapter<unknown, unknown>): void {
    this.adapter = adapter;
  }

  static define<
    ModelOrInterface,
    Attributes extends Dictionary,
    Parameters extends Dictionary = Dictionary,
    ReturnType extends InstanceOrInterface<ModelOrInterface> = InstanceOrInterface<ModelOrInterface>,
  >(
    model: ModelOrInterface,
    defaultAttributesFactory: DefaultAttributesFactory<Attributes, Parameters>,
  ): Factory<ModelOrInterface, Attributes, Parameters, ReturnType> {
    return new Factory<ModelOrInterface, Attributes, Parameters, ReturnType>(
      defaultAttributesFactory,
      model,
      this.adapter as ModelAdapter<ModelOrInterface, ReturnType>,
    );
  }
}
