import { EntitySchema } from '@mikro-orm/core';
import { UserProfilePreferencesEntity } from './user-profile-preferences.entity';
import { UserProfileEntity } from './user-profile.entity';

export const userProfileSchema = new EntitySchema<UserProfileEntity>({
  class: UserProfileEntity,
  properties: {
    id: { type: Number, primary: true, nullable: false, autoincrement: true },
    email: { type: String, nullable: false },
    photo: { type: String, nullable: true },
    preferences: {
      reference: '1:1',
      entity: () => UserProfilePreferencesEntity,
      mappedBy: 'userProfile',
      nullable: true,
    },
    user: {
      reference: '1:1',
      entity: () => 'UserEntity',
      inversedBy: 'profile',
      nullable: false,
    },
  },
});
