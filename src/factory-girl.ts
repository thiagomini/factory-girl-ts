import { ModelAdapter } from './adapters/adapter.interface';
import { ObjectAdapter } from './adapters/object.adapter';
import { Factory } from './factory';
import { DefaultAttributesFactory } from './interfaces';
import { Dictionary } from './types';
import { InstanceOrInterface } from './types/instance-or-interface.type';

export class FactoryGirl {
  static adapter: ModelAdapter<unknown, unknown> = new ObjectAdapter();

  static setAdapter(adapter: ModelAdapter<unknown, unknown>): void {
    this.adapter = adapter;
  }

  static define<
    ModelOrInterface,
    Parameters extends Dictionary = Dictionary,
    Attributes extends Dictionary = Dictionary,
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
