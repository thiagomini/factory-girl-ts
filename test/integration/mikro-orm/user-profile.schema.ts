import { EntitySchema } from '@mikro-orm/core';
import { UserProfilePreferencesEntity } from './user-profile-preferences.entity';
import { UserProfileEntity } from './user-profile.entity';

export const userProfileSchema = new EntitySchema<UserProfileEntity>({
  class: UserProfileEntity,
  properties: {
    id: { type: Number, primary: true, nullable: false, autoincrement: true },
    userId: { type: Number, nullable: false },
    email: { type: String, nullable: false },
    photo: { type: String, nullable: true },
    preferences: {
      reference: '1:1',
      entity: () => UserProfilePreferencesEntity,
      inversedBy: 'userProfile',
      nullable: true,
    },
  },
});
