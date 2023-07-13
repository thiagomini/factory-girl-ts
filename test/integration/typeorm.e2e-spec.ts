import { faker } from '@faker-js/faker';
import { TypeOrmRepositoryAdapter } from '@src/adapters/typeorm.adapter';
import { FactoryGirl } from '@src/factory-girl';
import {
  Address,
  AddressActiveRecord,
  User,
  UserActiveRecord,
} from '@test/integration/typeorm.models';
import { DataSource } from 'typeorm';
import { PhoneNumber } from './phone.value';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  synchronize: true,
  entities: [User, Address, UserActiveRecord, AddressActiveRecord],
});

const defaultUserAttributes = {
  id: expect.any(Number),
  name: expect.any(String),
  email: expect.any(String),
  phoneNumber: null,
};

describe('Typeorm integration', () => {
  beforeAll(async () => {
    await dataSource.initialize();
    await dataSource.getRepository(Address).delete({});
    await dataSource.getRepository(User).delete({});
  });

  const generateUserDefaultAttributes = () => ({
    id: 1,
    name: 'John',
    email: 'some-email@mail.com',
  });

  describe('Repository pattern', () => {
    beforeEach(() => {
      FactoryGirl.setAdapter(new TypeOrmRepositoryAdapter(dataSource));
    });

    it('builds a User model', () => {
      // Arrange
      const userFactory = FactoryGirl.define(
        User,
        generateUserDefaultAttributes,
      );

      // Act
      const user = userFactory.build();

      // Assert
      expect(user.id).toBe(1);
      expect(user.name).toBe('John');
      expect(user.email).toBe('some-email@mail.com');
    });

    it('builds a model with association', () => {
      // Arrange
      const userFactory = FactoryGirl.define(
        User,
        generateUserDefaultAttributes,
      );
      const addressFactory = FactoryGirl.define(Address, () => ({
        id: 1,
        street: '123 Fake St.',
        city: 'Springfield',
        state: 'IL',
        zip: '90210',
        user: userFactory.associate(),
      }));

      // Act
      const address = addressFactory.build();

      // Assert
      expect(address).toEqual<Address>({
        city: 'Springfield',
        id: 1,
        state: 'IL',
        street: '123 Fake St.',
        zip: '90210',
        user: {
          id: 1,
          name: 'John',
          email: 'some-email@mail.com',
        },
      });
    });

    it('creates a User model', async () => {
      const defaultAttributesFactory = () => ({
        name: 'John',
        email: 'some-email@mail.com',
        phoneNumber: new PhoneNumber('1234567890'),
      });
      const userFactory = FactoryGirl.define(User, defaultAttributesFactory);

      // Act
      const user = await userFactory.create();

      // Assert
      const userRepository = dataSource.getRepository(User);
      const userInDatabase = await userRepository.findOneBy({
        id: user.id,
      });

      expect(user).toEqual({
        id: expect.any(Number),
        name: 'John',
        email: 'some-email@mail.com',
        phoneNumber: new PhoneNumber('1234567890'),
      });
      expect(userInDatabase).toEqual({
        id: expect.any(Number),
        name: 'John',
        email: 'some-email@mail.com',
        phoneNumber: new PhoneNumber('1234567890'),
      });
    });

    it('creates an Address model with association', async () => {
      const userFactory = FactoryGirl.define(
        User,
        generateUserDefaultAttributes,
      );
      const addressFactory = FactoryGirl.define(Address, () => ({
        id: 1,
        street: '123 Fake St.',
        city: 'Springfield',
        state: 'IL',
        zip: '90210',
        user: userFactory.associate(),
      }));

      // Act
      const address = await addressFactory.create();

      // Assert
      const addressRepository = dataSource.getRepository(Address);
      const [addressInDatabase] = await addressRepository.find({
        where: {
          id: address.id,
        },
        relations: {
          user: true,
        },
      });

      expect(address).toEqual({
        id: expect.any(Number),
        street: '123 Fake St.',
        city: 'Springfield',
        state: 'IL',
        zip: '90210',
        user: defaultUserAttributes,
      });
      expect(addressInDatabase).toBeTruthy();
      expect(addressInDatabase.user).toBeTruthy();
    });
  });

  describe('Active Record pattern', () => {
    it('builds a User model', () => {
      // Arrange
      const userFactory = FactoryGirl.define(
        UserActiveRecord,
        generateUserDefaultAttributes,
      );

      // Act
      const user = userFactory.build();

      // Assert
      expect(user.id).toBe(1);
      expect(user.name).toBe('John');
      expect(user.email).toBe('some-email@mail.com');
    });

    it('builds a model with association', () => {
      // Arrange
      const userFactory = FactoryGirl.define(
        UserActiveRecord,
        generateUserDefaultAttributes,
      );
      const addressFactory = FactoryGirl.define(AddressActiveRecord, () => ({
        id: 1,
        street: '123 Fake St.',
        city: 'Springfield',
        state: 'IL',
        zip: '90210',
        user: userFactory.associate(),
      }));

      // Act
      const address = addressFactory.build();

      // Assert
      expect(address).toEqual<Address>({
        city: 'Springfield',
        id: 1,
        state: 'IL',
        street: '123 Fake St.',
        zip: '90210',
        user: {
          id: 1,
          name: 'John',
          email: 'some-email@mail.com',
        },
      });
    });

    it('creates a User model', async () => {
      const defaultAttributesFactory = () => ({
        name: 'John',
        email: 'some-email@mail.com',
      });
      const userFactory = FactoryGirl.define(
        UserActiveRecord,
        defaultAttributesFactory,
      );

      // Act
      const user = await userFactory.create();

      // Assert
      const userInDatabase = await UserActiveRecord.findOneBy({
        id: user.id,
      });

      expect(user).toEqual({
        ...defaultUserAttributes,
        name: 'John',
        email: 'some-email@mail.com',
      });
      expect(userInDatabase).toEqual({
        ...defaultUserAttributes,
        name: 'John',
        email: 'some-email@mail.com',
      });
    });

    it('creates a User model with overrided attributes', async () => {
      const defaultAttributesFactory = () => ({
        name: 'John',
        email: faker.internet.email(),
      });
      const userFactory = FactoryGirl.define(
        UserActiveRecord,
        defaultAttributesFactory,
      );

      // Act
      const user = await userFactory.create({
        name: 'JohnModified',
      });

      // Assert
      const userInDatabase = await UserActiveRecord.findOneBy({
        id: user.id,
      });

      expect(user).toEqual({
        ...defaultUserAttributes,
        name: 'JohnModified',
      });
      expect(userInDatabase).toEqual({
        ...defaultUserAttributes,
        name: 'JohnModified',
        email: user.email,
      });
    });

    it('creates a User model with extended factory', async () => {
      const defaultAttributesFactory = () => ({
        name: 'John',
        email: 'some-email@mail.com',
      });
      const userFactory = FactoryGirl.define(
        UserActiveRecord,
        defaultAttributesFactory,
      );
      const extendedUserFactory = userFactory.extend(() => ({
        name: 'JohnExtended',
      }));

      // Act
      const user = await extendedUserFactory.create();

      // Assert
      const userInDatabase = await UserActiveRecord.findOneBy({
        id: user.id,
      });

      expect(user).toEqual({
        ...defaultUserAttributes,
        name: 'JohnExtended',
      });
      expect(userInDatabase).toEqual({
        ...defaultUserAttributes,
        name: 'JohnExtended',
      });
    });

    it('creates a User model with afterCreate hook', async () => {
      const defaultAttributesFactory = () => ({
        name: 'John',
        email: 'some-email@mail.com',
      });
      const userFactory = FactoryGirl.define(
        UserActiveRecord,
        defaultAttributesFactory,
      );
      const userFactoryWithAfterCreate = userFactory.afterCreate(
        async (user) => {
          user.name = 'JohnAfterCreate';
          await user.save();
          return user;
        },
      );

      // Act
      const user = await userFactoryWithAfterCreate.create();

      // Assert
      const userInDatabase = await UserActiveRecord.findOneBy({
        id: user.id,
      });

      expect(user).toEqual({
        ...defaultUserAttributes,
        name: 'JohnAfterCreate',
      });
      expect(userInDatabase).toEqual({
        ...defaultUserAttributes,
        name: 'JohnAfterCreate',
      });
    });

    it('creates an Address model with association', async () => {
      const userFactory = FactoryGirl.define(
        UserActiveRecord,
        generateUserDefaultAttributes,
      );
      const addressFactory = FactoryGirl.define(AddressActiveRecord, () => ({
        id: 1,
        street: '123 Fake St.',
        city: 'Springfield',
        state: 'IL',
        zip: '90210',
        user: userFactory.associate(),
      }));

      // Act
      const address = await addressFactory.create();

      // Assert
      const addressInDatabase = await AddressActiveRecord.findOne({
        where: {
          id: address.id,
        },
        relations: {
          user: true,
        },
      });

      expect(address).toEqual({
        id: expect.any(Number),
        street: '123 Fake St.',
        city: 'Springfield',
        state: 'IL',
        zip: '90210',
        user: {
          id: expect.any(Number),
          name: 'John',
          email: 'some-email@mail.com',
        },
      });
      expect(addressInDatabase).toBeTruthy();
      expect(addressInDatabase?.user).toBeTruthy();
    });
  });
});
