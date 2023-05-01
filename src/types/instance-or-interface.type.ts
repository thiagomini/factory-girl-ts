import { Class } from 'type-fest';

export type InstanceOrInterface<T> = T extends Class<infer U> ? U : T;
