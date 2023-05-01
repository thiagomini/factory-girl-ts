import { SequelizeAdapter } from '@src/adapters/sequelize.adapter';
import { FactoryGirl } from '@src/factory-girl';
import { DataTypes, Model, Sequelize } from 'sequelize';
const sequelize = new Sequelize(
  'postgres://postgres:pass123@localhost:5432/postgres',
  {
    sync: {
      force: true,
      schema: 'public',
    },
  },
);

class User extends Model<{
  id: number;
  name: string;
  email: string;
}> {
  public id!: number;
  public name!: string;
  public email!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
  },
);

describe('Sequelize Integration', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  it('authenticates', async () => {
    await expect(sequelize.authenticate()).resolves.toBeUndefined();
  });

  it('builds a User model', async () => {
    const defaultAttributesFactory = () => ({
      name: 'John',
      email: 'some-email@mail.com',
    });

    FactoryGirl.setAdapter(new SequelizeAdapter());

    const userFactory = FactoryGirl.define(User, defaultAttributesFactory);

    const user = userFactory.build();

    expect(user.get('name')).toEqual('John');
    expect(user.get('email')).toEqual('some-email@mail.com');
  });
});
