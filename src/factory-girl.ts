import { Dictionary } from '@src/types';
import { Factory } from './factory';
import { DefaultAttributesFactory } from './interfaces';

export class FactoryGirl {
  static define<T extends Dictionary, P extends Dictionary = Dictionary>(
    defaultAttributesFactory: DefaultAttributesFactory<T, P>,
  ): Factory<T, P> {
    return new Factory(defaultAttributesFactory);
  }
}
