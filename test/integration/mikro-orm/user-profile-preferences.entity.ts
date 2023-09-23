import { Reference } from '@mikro-orm/core';
import { UserProfileEntity } from './user-profile.entity';

export class UserProfilePreferencesEntity {
  public readonly id!: number;
  public readonly userProfile!: Reference<UserProfileEntity>;
  public readonly theme!: string;
}
