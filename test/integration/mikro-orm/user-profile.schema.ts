import { EntitySchema } from '@mikro-orm/core';
import { UserProfileEntity } from './user-profile.entity';

export const userProfileSchema = new EntitySchema<UserProfileEntity>({
  class: UserProfileEntity,
  properties: {
    id: { type: Number, primary: true, nullable: false, autoincrement: true },
    userId: { type: Number, nullable: false },
    email: { type: String, nullable: false },
    photo: { type: String, nullable: true },
  },
});
