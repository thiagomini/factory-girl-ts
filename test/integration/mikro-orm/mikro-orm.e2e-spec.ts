import { MikroORM, wrap } from '@mikro-orm/core';
import { MikroOrmAdapter } from '@src/adapters/mikro-orm.adapter';
import { FactoryGirl } from '@src/factory-girl';
import { AddressEntity } from './address.entity';
import { addressSchema } from './address.schema';
import { UserEntity } from './user.entity';
import { userSchema } from './user.schema';

let orm: MikroORM;

describe('Mikro Orm Integration', () => {
  const buildUserDefaultAttributes = () => ({
    email: 'mikro-orm@mail.com',
    name: 'Mikro Orm',
    address: null,
    phone: null,
  });

  const userFactory = FactoryGirl.define(
    UserEntity,
    buildUserDefaultAttributes,
  );

  beforeAll(async () => {
    orm = await MikroORM.init({
      clientUrl: 'postgresql://postgres:pass123@localhost:5432/postgres',
      schema: 'mikro',
      entities: [userSchema, addressSchema],
      type: 'postgresql',
    });

    await orm.getSchemaGenerator().updateSchema({
      safe: true,
    });

    FactoryGirl.setAdapter(new MikroOrmAdapter(orm));
  });

  afterEach(async () => {
    await orm.getSchemaGenerator().refreshDatabase();
  });

  describe('create', () => {
    test('creates a user', async () => {
      const user = await userFactory.create();

      expect(user).toEqual({
        id: expect.any(Number),
        ...buildUserDefaultAttributes(),
      });
    });

    test('creates a user with null attribute', async () => {
      // Arrange
      const userFactoryWithNull = FactoryGirl.define(UserEntity, () => {
        return {
          name: 'User',
          email: 'mail@mail.com',
          phone: null,
        };
      });

      // Act
      const userWithNullName = await userFactoryWithNull.create({
        phone: '+55 11 99999-9999',
      });

      expect(userWithNullName).toEqual({
        id: expect.any(Number),
        name: 'User',
        email: 'mail@mail.com',
        phone: '+55 11 99999-9999',
      });
    });

    test('creates a user with overwritten attributes', async () => {
      const user = await userFactory.create({
        email: 'custom-email@mail.com',
      });

      expect(user).toEqual({
        ...buildUserDefaultAttributes(),
        id: expect.any(Number),
        email: 'custom-email@mail.com',
      });
    });

    test('creates a user in the database', async () => {
      // Arrange
      const user = await userFactory.create();

      // Act
      const userInDatabase = await findUserById(user.id);

      // Assert
      expect(userInDatabase).toEqual(user);
    });

    test('creates a user with afterCreate hook', async () => {
      // Arrange
      const userFactoryWithAfterHook = userFactory.afterCreate(
        async (user, adapter) => {
          wrap(user).assign({
            name: 'Mikro Orm After Hook',
          });
          await adapter.save(user);
          return user;
        },
      );

      // Act
      const user = await userFactoryWithAfterHook.create();

      // Assert
      expect(user).toEqual({
        id: expect.any(Number),
        ...buildUserDefaultAttributes(),
        name: 'Mikro Orm After Hook',
      });
    });

    test('creates a user with an extended factory', async () => {
      // Arrange
      const userFactoryWithAfterHook = userFactory.extend(async () => ({
        name: 'Extended Name',
      }));

      // Act
      const user = await userFactoryWithAfterHook.create();

      // Assert
      expect(user).toEqual({
        id: expect.any(Number),
        ...buildUserDefaultAttributes(),
        name: 'Extended Name',
      });
    });

    test('creates an address with a relationship', async () => {
      const addressFactory = FactoryGirl.define(AddressEntity, () => ({
        city: 'Mikro Orm City',
        user: userFactory.associate(),
      }));

      const address = await addressFactory.create();

      expect(address).toEqual({
        id: expect.any(Number),
        city: 'Mikro Orm City',
        user: {
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          address: expect.any(AddressEntity),
          phone: null,
        },
      });
    });
  });
});

async function findUserById(id: number) {
  return await orm.em.fork().findOne(UserEntity, id, {
    refresh: true,
  });
}
