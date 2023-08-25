import { EntitySchema } from '@mikro-orm/core';
import { AddressEntity } from './address.entity';
import { UserEntity } from './user.entity';

export const addressSchema = new EntitySchema<AddressEntity>({
  class: AddressEntity,
  properties: {
    id: { type: Number, primary: true, nullable: false, autoincrement: true },
    city: { type: String, nullable: false },
    user: {
      reference: '1:1',
      entity: () => UserEntity,
    },
  },
});
