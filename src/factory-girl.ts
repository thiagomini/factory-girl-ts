/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModelAdapter } from './adapters/adapter.interface';
import { ObjectAdapter } from './adapters/object.adapter';
import { Factory } from './factory';
import { DefaultAttributesFactory } from './interfaces';
import { DeepPartialAttributes } from './types';
import { InstanceOrInterface } from './types/instance-or-interface.type';

export class FactoryGirl {
  static adapter: ModelAdapter<unknown, unknown> = new ObjectAdapter();

  static sequences = new Map<string, number>();

  /**
   * Define a sequence of numbers to be used in the factory. The sequence is defined by a name and a callback
   * that receives the current value of the sequence and returns the next value.
   * @param id The name of the sequence.
   * @param callback A function that receives the current value of the sequence and returns the next value.
   * @returns The next value of the sequence.
   * @example
   * const userFactory = FactoryGirl.define<User>('User', () => ({
   *    name: 'John Doe',
   *    email: FactoryGirl.sequence('user.email', (n: number) => `test-${n}@mail.com`),
   *  })
   * )
   * const user1 = await userFactory.build();
   * const user2 = await userFactory.build();
   * // user1.email === 'test-1@mail.com'
   * // user2.email === 'test-2@mail.com'
   */
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

  /**
   * Define a factory for a model, specifying its default attributes and options. The adapter should be defined
   * to work properly.
   * @param model The model to define a factory for. It can be either a model class or an interface.
   * @param defaultAttributesFactory A function that returns the default attributes for the model.
   * @returns A factory for the model.
   */
  static define<
    ModelOrInterface,
    Attributes = DeepPartialAttributes<InstanceOrInterface<ModelOrInterface>>,
    Parameters = any,
    ReturnType extends
      InstanceOrInterface<ModelOrInterface> = InstanceOrInterface<ModelOrInterface>,
  >(
    model: ModelOrInterface,
    defaultAttributesFactory: DefaultAttributesFactory<Attributes, Parameters>,
    adapter?: ModelAdapter<ModelOrInterface, ReturnType>,
  ): Factory<ModelOrInterface, Attributes, Parameters, ReturnType> {
    return new Factory<ModelOrInterface, Attributes, Parameters, ReturnType>(
      defaultAttributesFactory,
      model,
      () =>
        adapter ?? (this.adapter as ModelAdapter<ModelOrInterface, ReturnType>),
    );
  }

  static cleanUp(): void {
    FactoryGirl.sequences.clear();
  }
}
