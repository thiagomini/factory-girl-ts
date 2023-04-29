import { Factory } from './factory';
import { DefaultAttributesFactory } from './interfaces';

export class FactoryGirl {
  static define<
    T extends Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>,
  >(defaultAttributesFactory: DefaultAttributesFactory<T, P>): Factory<T, P> {
    return new Factory(defaultAttributesFactory);
  }
}
