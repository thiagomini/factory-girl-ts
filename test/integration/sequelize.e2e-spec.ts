import { faker } from '@faker-js/faker';
import { SequelizeAdapter } from '@src/adapters/sequelize.adapter';
import { FactoryGirl } from '@src/factory-girl';
import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize';

const sequelize = new Sequelize(
  'postgres://postgres:pass123@localhost:5432/postgres',
  {
    sync: {
      force: true,
      schema: 'public',
    },
    logging: false,
  },
);

class User extends Model<InferAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;

  declare addresses?: NonAttribute<Address[]>;
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
  declare id: CreationOptional<number>;
  declare street: string;
  declare city: string;
  declare state: string;
  declare zip: string;
  declare userId: ForeignKey<User['id']>;

  declare user?: NonAttribute<User>;
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
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(() => {
    FactoryGirl.setAdapter(new SequelizeAdapter());
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('authenticates', async () => {
    await expect(sequelize.authenticate()).resolves.toBeUndefined();
  });

  it('builds a User model', async () => {
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

  it('builds an Address model with relationship id', async () => {
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

  it('creates a User model', async () => {
    // Arrange
    const defaultAttributesFactory = () => ({
      name: 'John',
      email: 'some-email@mail.com',
    });
    const userFactory = FactoryGirl.define(User, defaultAttributesFactory);

    // Act
    const user = await userFactory.create();

    // Assert
    expect(user.id).toEqual(expect.any(Number));
    expect(user.get('name')).toEqual('John');
    expect(user.get('email')).toEqual('some-email@mail.com');

    const userInDatabase = await User.findByPk(user.get('id'));
    expect(userInDatabase?.dataValues).toEqual(user.dataValues);
  });

  it('creates a User model with overrided attributes', async () => {
    // Arrange
    const defaultAttributesFactory = () => ({
      name: 'John',
      email: faker.internet.email(),
    });
    const userFactory = FactoryGirl.define(User, defaultAttributesFactory);

    // Act
    const user = await userFactory.create({
      name: 'JohnModified',
    });

    // Assert
    expect(user.id).toEqual(expect.any(Number));
    expect(user.get('name')).toEqual('JohnModified');

    const userInDatabase = await User.findByPk(user.get('id'));
    expect(userInDatabase?.dataValues).toEqual(user.dataValues);
  });

  it('creates many User models', async () => {
    // Arrange
    const defaultAttributesFactory = () => ({
      name: faker.name.firstName(),
      email: faker.internet.email(),
    });
    const userFactory = FactoryGirl.define(User, defaultAttributesFactory);

    // Act
    const users = await userFactory.createMany(2, [
      {
        name: 'first',
      },
      {
        name: 'second',
      },
    ]);

    // Assert
    expect(users[0].get('name')).toEqual('first');
    expect(users[1].get('name')).toEqual('second');

    const usersInDatabase = await User.findAll({
      where: {
        name: ['first', 'second'],
      },
    });
    expect(usersInDatabase).toHaveLength(2);
  });
});
