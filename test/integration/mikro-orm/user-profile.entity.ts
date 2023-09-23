import { Reference } from '@mikro-orm/core';
import type { UserEntity } from './user.entity';

export class UserProfileEntity {
  public readonly id!: number;
  public readonly user!: Reference<UserEntity>;
  public readonly email!: string;
  public readonly photo?: string;
}
