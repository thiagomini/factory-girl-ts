export interface AfterCreateHook<T> {
  (model: T): Promise<T> | T;
}

export interface MutationHook<Input, Output = Input> {
  (model: Input): Output;
}
