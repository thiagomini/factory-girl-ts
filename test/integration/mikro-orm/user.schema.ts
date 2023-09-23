import { EntitySchema } from '@mikro-orm/core';
import { AddressEntity } from './address.entity';
import { UserEntity } from './user.entity';

export const userSchema = new EntitySchema<UserEntity>({
  class: UserEntity,
  properties: {
    id: { type: Number, primary: true, nullable: false, autoincrement: true },
    name: { type: String, nullable: false },
    email: { type: String, nullable: false },
    address: {
      reference: '1:1',
      persist: true,
      entity: () => AddressEntity,
      mappedBy: 'user',
    },
    profile: {
      reference: '1:1',
      entity: () => 'UserProfileEntity',
      mappedBy: 'user',
      nullable: true,
    },
    phone: {
      type: String,
      nullable: true,
    },
  },
});
