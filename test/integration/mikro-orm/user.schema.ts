import { EntitySchema } from '@mikro-orm/core';
import { UserEntity } from './user.entity';

export const userSchema = new EntitySchema<UserEntity>({
  class: UserEntity,
  properties: {
    id: { type: Number, primary: true, nullable: false, autoincrement: true },
    name: { type: String, nullable: false },
    email: { type: String, nullable: false },
  },
});
