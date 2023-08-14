import { PartialDeep } from 'type-fest';
import { NonFunctionProperties } from './non-function-properties.type';

export type DeepPartialAttributes<T> = PartialDeep<NonFunctionProperties<T>>;
