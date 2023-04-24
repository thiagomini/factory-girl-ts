export interface Creator<T> {
  create(partial: Partial<T>): Promise<T>;
}
