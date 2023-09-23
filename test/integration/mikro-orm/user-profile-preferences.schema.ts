import { EntitySchema } from '@mikro-orm/core';
import { UserProfilePreferencesEntity } from './user-profile-preferences.entity';
import { UserProfileEntity } from './user-profile.entity';

export const userProfilePreferencesSchema =
  new EntitySchema<UserProfilePreferencesEntity>({
    class: UserProfilePreferencesEntity,
    properties: {
      id: { type: Number, primary: true, nullable: false, autoincrement: true },
      theme: { type: String, nullable: false },
      userProfile: {
        reference: '1:1',
        entity: () => UserProfileEntity,
        inversedBy: 'preferences',
      },
    },
  });
