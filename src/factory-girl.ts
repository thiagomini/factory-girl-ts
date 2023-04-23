import { Factory } from "./interfaces";

export class FactoryGirl {
  static define<T>(defaultAttributesFactory: () => T): Factory<T> {
    return new Factory(defaultAttributesFactory);
  }
}
