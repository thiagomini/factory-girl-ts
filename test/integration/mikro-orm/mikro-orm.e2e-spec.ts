import { MikroORM } from '@mikro-orm/core';
import { MikroOrmAdapter } from '@src/adapters/mikro-orm.adapter';
import { FactoryGirl } from '@src/factory-girl';
import { UserEntity } from './user.entity';
import { userSchema } from './user.schema';

let orm: MikroORM;

describe('Mikro Orm Integration', () => {
  const buildUserDefaultAttributes = () => ({
    email: 'mikro-orm@mail.com',
    name: 'Mikro Orm',
  });

  const userFactory = FactoryGirl.define(
    UserEntity,
    buildUserDefaultAttributes,
  );

  beforeAll(async () => {
    orm = await MikroORM.init({
      clientUrl: 'postgresql://postgres:pass123@localhost:5432/postgres',
      schema: 'mikro',
      entities: [userSchema],
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
  });
});

async function findUserById(id: number) {
  return await orm.em.fork().findOne(UserEntity, id, {
    refresh: true,
  });
}
