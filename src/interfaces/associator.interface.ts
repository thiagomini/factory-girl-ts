import { Association } from '@src/association';

export type Associate<T, K extends keyof T> = () => T | T[K];

export interface Associator<T> {
  associate<K extends keyof T>(keyOrType?: K): Association<T>;
}
