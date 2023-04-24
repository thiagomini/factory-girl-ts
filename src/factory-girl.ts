import { Factory } from "./factory";
import { DefaultAttributesFactory } from "./interfaces";

export class FactoryGirl {
  static define<T extends Record<string, unknown>>(
    defaultAttributesFactory: DefaultAttributesFactory<T>
  ): Factory<T> {
    return new Factory(defaultAttributesFactory);
  }
}
