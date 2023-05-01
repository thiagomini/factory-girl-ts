import { SequelizeAdapter } from '@src/adapters/sequelize.adapter';
import { FactoryGirl } from '@src/factory-girl';
import { DataTypes, InferAttributes, Model, Sequelize } from 'sequelize';
const sequelize = new Sequelize(
  'postgres://postgres:pass123@localhost:5432/postgres',
  {
    sync: {
      force: true,
      schema: 'public',
    },
  },
);

class User extends Model<InferAttributes<User>> {
  declare id: number;
  declare name: string;
  declare email: string;
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

class Address extends Model<InferAttributes<Address>> {
  declare id: number;
  declare street: string;
  declare city: string;
  declare state: string;
  declare zip: string;
  declare userId: number;
}

Address.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.STRING,
    userId: DataTypes.INTEGER,
  },
  {
    sequelize,
    modelName: 'Address',
  },
);

User.hasMany(Address, { foreignKey: 'userId' });

describe('Sequelize Integration', () => {
  beforeEach(() => {
    FactoryGirl.setAdapter(new SequelizeAdapter());
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('authenticates', async () => {
    await expect(sequelize.authenticate()).resolves.toBeUndefined();
  });

  it('builds a User model with association', async () => {
    // Arrange
    const defaultAttributesFactory = () => ({
      name: 'John',
      email: 'some-email@mail.com',
    });
    const userFactory = FactoryGirl.define(User, defaultAttributesFactory);

    // Act
    const user = userFactory.build();

    // Assert
    expect(user.get('name')).toEqual('John');
    expect(user.get('email')).toEqual('some-email@mail.com');
  });

  it('builds an Address model with relationship', async () => {
    // Arrange
    const defaultAttributesFactory = () => ({
      id: 1,
      name: 'John',
      email: 'some-email@mail.com',
    });

    const userFactory = FactoryGirl.define(User, defaultAttributesFactory);
    const addressFactory = FactoryGirl.define(Address, () => ({
      id: 1,
      street: '123 Fake St.',
      city: 'Springfield',
      state: 'IL',
      zip: '90210',
      userId: userFactory.associate('id'),
    }));

    // Act
    const address = addressFactory.build();

    // Assert
    expect(address.get('street')).toBe('123 Fake St.');
    expect(address.get('city')).toBe('Springfield');
    expect(address.get('state')).toBe('IL');
    expect(address.get('zip')).toBe('90210');
    expect(address.userId).toBe(1);
  });
});
