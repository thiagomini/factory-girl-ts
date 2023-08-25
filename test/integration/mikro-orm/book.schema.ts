import { EntitySchema } from '@mikro-orm/core';
import { BookEntity } from './book.entity';
import { UserEntity } from './user.entity';

export const bookSchema = new EntitySchema<BookEntity>({
  class: BookEntity,
  tableName: 'books',
  properties: {
    id: { type: Number, primary: true, nullable: false, autoincrement: true },
    name: { type: String, nullable: false },
    author: {
      reference: 'm:1',
      entity: () => UserEntity,
      persist: false,
      name: 'authorId',
    },
    authorId: {
      type: Number,
    },
  },
});
