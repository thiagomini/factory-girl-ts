import { Association } from '@src/association';

export interface Associator<T, P, ReturnType> {
  associate<K extends keyof ReturnType>(
    keyOrType?: K,
  ): Association<T, P, ReturnType>;
}
