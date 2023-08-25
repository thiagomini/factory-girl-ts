import { EntitySchema } from '@mikro-orm/core';
import { PhoneUser } from './phone-user.entity';

export const userSchema = new EntitySchema<PhoneUser>({
  class: PhoneUser,
  tableName: 'user_entity',
  properties: {
    id: {
      type: Number,
      primary: true,
      nullable: false,
      autoincrement: true,
      persist: false,
    },
    phone: {
      type: String,
      nullable: true,
      persist: false,
    },
  },
});
