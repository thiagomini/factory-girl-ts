import { ModelAdapter } from '../adapters';

export interface AfterCreateHook<T> {
  (model: T, adapter: ModelAdapter<T, T>): Promise<T> | T;
}

export interface AfterBuildHook<T> {
  (model: T): Promise<T> | T;
}
