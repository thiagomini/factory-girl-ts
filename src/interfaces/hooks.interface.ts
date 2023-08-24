export interface AfterCreateHook<T> {
  (model: T): Promise<T> | T;
}

export interface AfterBuildHook<T> {
  (model: T): Promise<T> | T;
}
