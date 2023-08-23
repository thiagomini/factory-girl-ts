export interface AfterCreateHook<T> {
  (model: T): Promise<T> | T;
}
