import { MikroORM } from '@mikro-orm/core';
import { MikroOrmAdapter } from '@src/adapters/mikro-orm.adapter';
import { FactoryGirl } from '@src/factory-girl';
import { UserEntity } from './user.entity';
import { userSchema } from './user.schema';

describe('Mikro Orm Integration', () => {
  let orm: MikroORM;

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
  });
});
