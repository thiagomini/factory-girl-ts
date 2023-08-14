import { ModelAdapter } from './adapters/adapter.interface';
import { ObjectAdapter } from './adapters/object.adapter';
import { Factory } from './factory';
import { DefaultAttributesFactory } from './interfaces';
import { DeepPartialAttributes, Dictionary } from './types';
import { InstanceOrInterface } from './types/instance-or-interface.type';

export class FactoryGirl {
  static adapter: ModelAdapter<unknown, unknown> = new ObjectAdapter();

  static sequences = new Map<string, number>();

  static sequence<T>(id: string, callback: (seq: number) => T) {
    let seq = FactoryGirl.sequences.get(id);
    if (seq === undefined) seq = 0;
    seq++;
    FactoryGirl.sequences.set(id, seq);
    return callback(seq);
  }

  static setAdapter(adapter: ModelAdapter<unknown, unknown>): void {
    this.adapter = adapter;
  }

  static define<
    ModelOrInterface,
    Attributes = DeepPartialAttributes<ModelOrInterface>,
    Parameters = Dictionary,
    ReturnType extends InstanceOrInterface<ModelOrInterface> = InstanceOrInterface<ModelOrInterface>,
  >(
    model: ModelOrInterface,
    defaultAttributesFactory: DefaultAttributesFactory<Attributes, Parameters>,
  ): Factory<ModelOrInterface, Attributes, Parameters, ReturnType> {
    return new Factory<ModelOrInterface, Attributes, Parameters, ReturnType>(
      defaultAttributesFactory,
      model,
      () => this.adapter as ModelAdapter<ModelOrInterface, ReturnType>,
    );
  }

  static cleanUp(): void {
    FactoryGirl.sequences.clear();
  }
}
