import { FactoryGirl } from '@src/factory-girl';
import { plainObject } from '@src/utils';
import { ObjectAdapter, SequelizeAdapter } from '../lib';
import { DeepPartialAttributes } from '../src';

type User = {
  id: number;
  name: string;
  email: string;
  address: Address;
};

type Address = {
  id: number;
  street: string;
  number: number;
  city: string;
  userId?: number;
};

function buildUserAttributes(): User {
  return {
    id: 1,
    name: 'John Doe',
    email: 'user@mail.com',
    address: {
      id: 1,
      street: 'Main Street',
      number: 123,
      city: 'New York',
    },
  };
}

function buildAddressAttributes(): Address {
  return {
    id: 1,
    street: 'Main Street',
    number: 123,
    city: 'New York',
  };
}

describe('Factory', () => {
  const userFactory = FactoryGirl.define(
    plainObject<User>(),
    buildUserAttributes,
  );

  const addressFactory = FactoryGirl.define(
    plainObject<Address>(),
    buildAddressAttributes,
  );

  beforeEach(() => {
    FactoryGirl.cleanUp();
  });

  describe('build', () => {
    it('should build the given type with all properties', async () => {
      // Act
      const user = await userFactory.build();

      // Assert
      expect(user).toEqual(buildUserAttributes());
    });

    it('should build with deep merged partial properties', async () => {
      // Act
      const user = await userFactory.build({
        name: 'Jane Doe',
        address: {
          number: 456,
        },
      });

      // Assert
      expect(user).toEqual({
        id: expect.any(Number),
        name: 'Jane Doe',
        email: 'user@mail.com',
        address: {
          id: expect.any(Number),
          street: 'Main Street',
          number: 456,
          city: 'New York',
        },
      });
    });

    it('should build with associated factory', async () => {
      // Arrange
      const addressFactory = FactoryGirl.define(plainObject<Address>(), () => {
        return {
          street: 'Main Street',
          number: 123,
          city: 'New York',
        };
      });
      const userFactory = FactoryGirl.define(plainObject<User>(), () => {
        return {
          name: 'John Doe',
          email: 'test@mail.com',
          address: addressFactory.associate(),
        };
      });

      // Act
      const user = await userFactory.build();

      // Assert
      expect(user).toEqual({
        name: 'John Doe',
        email: 'test@mail.com',
        address: {
          street: 'Main Street',
          number: 123,
          city: 'New York',
        },
      });
    });

    it('builds with transient parameters', async () => {
      // Arrange
      type UserTransientParams = {
        companyUser: boolean;
      };
      const userAttributes = buildUserAttributes();

      const userFactory = FactoryGirl.define<
        User,
        DeepPartialAttributes<User>,
        UserTransientParams
      >(plainObject<User>(), ({ transientParams }) => {
        return {
          ...userAttributes,
          email: transientParams?.companyUser
            ? 'user@company.com'
            : userAttributes.email,
        };
      });

      // Act
      const user = await userFactory.build({}, { companyUser: true });

      // Assert
      expect(user).toEqual({
        ...userAttributes,
        email: 'user@company.com',
      });
    });

    it('should build with sequence', async () => {
      // Arrange
      const userFactory = FactoryGirl.define(plainObject<User>(), () => {
        return {
          name: 'John Doe',
          email: FactoryGirl.sequence(
            'user.email',
            (n: number) => `test-${n}@mail.com`,
          ),
          address: {
            street: 'Main Street',
            number: 123,
            city: 'New York',
          },
        };
      });

      // Act
      const user = await userFactory.build();

      // Assert
      expect(user).toEqual({
        name: 'John Doe',
        email: 'test-1@mail.com',
        address: {
          street: 'Main Street',
          number: 123,
          city: 'New York',
        },
      });
    });

    it('should allow passing a parameter even when the default type is undefined', async () => {
      // Arrange
      const userFactory = FactoryGirl.define<User>(plainObject<User>(), () => ({
        name: undefined,
        address: undefined,
        email: 'some-email@mail.com',
      }));

      // Act
      const userWithName = await userFactory.build({
        name: 'Defined Name',
      });

      // Assert
      expect(userWithName).toEqual({
        email: 'some-email@mail.com',
        address: undefined,
        name: 'Defined Name',
      });
    });

    it('builds an object with many references to the same association', async () => {
      // Arrange
      const emails = ['first@mail.com', 'second@mail.com'];
      const userFactoryWithRandomValues = userFactory.extend(() => ({
        email: FactoryGirl.sequence('user.email', (n: number) => emails[n - 1]),
        id: FactoryGirl.sequence('user.id', (n: number) => n - 1),
      }));
      type UserProfile = {
        email: string;
        photo: string;
      };
      const userProfileFactory = FactoryGirl.define<UserProfile>(
        plainObject<UserProfile>(),
        () => {
          const userAssociation = userFactoryWithRandomValues.associate();
          return {
            email: userAssociation.get('email'),
            userId: userAssociation.get('id'),
            photo: 'some-photo.jpg',
          };
        },
      );

      // Act
      const userProfile = await userProfileFactory.build();

      // Assert
      expect(userProfile).toEqual({
        email: 'first@mail.com',
        userId: 1,
        photo: 'some-photo.jpg',
      });
    });
  });

  describe('buildMany', () => {
    it('should build many entities', async () => {
      // Arrange
      const userAttributes = buildUserAttributes();

      // Act
      const users = await userFactory.buildMany(2);

      // Assert
      expect(users).toEqual([userAttributes, userAttributes]);
    });

    it('should build many entities with given properties', async () => {
      // Arrange
      const userAttributes = buildUserAttributes();

      // Act
      const users = await userFactory.buildMany(2, [
        {
          name: 'Jane Doe',
        },
        {
          address: {
            number: 456,
          },
        },
      ]);

      // Assert
      expect(users).toEqual([
        {
          ...userAttributes,
          name: 'Jane Doe',
        },
        {
          ...userAttributes,
          address: {
            ...userAttributes.address,
            number: 456,
          },
        },
      ]);
    });

    it('should build many entities with the same properties', async () => {
      // Arrange
      const userAttributes = buildUserAttributes();

      // Act
      const users = await userFactory.buildMany(2, {
        email: 'modified-email@mail.com',
      });

      // Assert
      expect(users).toEqual([
        {
          ...userAttributes,
          email: 'modified-email@mail.com',
        },
        {
          ...userAttributes,
          email: 'modified-email@mail.com',
        },
      ]);
    });

    it('should build many entities with sequences', async () => {
      // Arrange
      const userFactory = FactoryGirl.define(plainObject<User>(), () => {
        return {
          name: 'John Doe',
          email: FactoryGirl.sequence(
            'users.email',
            (n: number) => `test-${n}@mail.com`,
          ),
          address: {
            street: 'Main Street',
            number: 123,
            city: 'New York',
          },
        };
      });

      // Act
      const users = await userFactory.buildMany(10);

      // Assert
      expect(users[0].email).toEqual('test-1@mail.com');
      expect(users[5].email).toEqual('test-6@mail.com');
      expect(users[9].email).toEqual('test-10@mail.com');
    });

    describe('when using transient params', () => {
      type UserTransientParams = {
        companyUser: boolean;
      };
      const userAttributes = buildUserAttributes();

      const userFactoryWithTransient = FactoryGirl.define<
        User,
        DeepPartialAttributes<User>,
        UserTransientParams
      >(plainObject<User>(), ({ transientParams }) => {
        return {
          ...userAttributes,
          email: transientParams?.companyUser
            ? 'user@company.com'
            : userAttributes.email,
        };
      });

      it('builds with transient parameters', async () => {
        // Act
        const users = await userFactoryWithTransient.buildMany(2, undefined, {
          companyUser: true,
        });

        // Assert
        expect(users).toEqual([
          {
            ...userAttributes,
            email: 'user@company.com',
          },
          {
            ...userAttributes,
            email: 'user@company.com',
          },
        ]);
      });

      it('builds with custom and transient parameters', async () => {
        // Act
        const users = await userFactoryWithTransient.buildMany(
          2,
          {
            name: 'Jane Doe',
          },
          { companyUser: true },
        );

        // Assert
        expect(users).toEqual([
          {
            ...userAttributes,
            name: 'Jane Doe',
            email: 'user@company.com',
          },
          {
            ...userAttributes,
            name: 'Jane Doe',
            email: 'user@company.com',
          },
        ]);
      });

      it('builds with array of custom parameters AND transient parameters', async () => {
        // Act
        const users = await userFactoryWithTransient.buildMany(
          2,
          [
            {
              name: 'Jane Doe',
            },
            {
              address: {
                number: 456,
              },
            },
          ],
          { companyUser: true },
        );

        // Assert
        expect(users).toEqual([
          {
            ...userAttributes,
            name: 'Jane Doe',
            email: 'user@company.com',
          },
          {
            ...userAttributes,
            address: {
              ...userAttributes.address,
              number: 456,
            },
            email: 'user@company.com',
          },
        ]);
      });
    });
  });

  describe('create', () => {
    it('creates an entity', async () => {
      // Arrange
      const userAttributes = buildUserAttributes();

      // Act
      const user = await userFactory.create();

      // Assert
      expect(user).toEqual(userAttributes);
    });

    it('creates an entity with associations', async () => {
      // Arrange
      const userAttributes = buildUserAttributes();
      const addressAttributes = buildAddressAttributes();
      const addressFactory = FactoryGirl.define(plainObject<Address>(), () => ({
        ...addressAttributes,
        userId: userFactory.associate('id'),
      }));

      // Act
      const address = await addressFactory.create();

      // Assert
      expect(address).toMatchObject(addressAttributes);
      expect(address.userId).toBe(userAttributes.id);
    });
  });

  describe('createMany', () => {
    it('creates many entities', async () => {
      // Arrange
      const userAttributes = buildUserAttributes();

      // Act
      const users = await userFactory.createMany(2);

      // Assert
      expect(users).toEqual([userAttributes, userAttributes]);
    });

    it('creates many entities with the same props', async () => {
      // Act
      const users = await userFactory.createMany(2, {
        name: 'same-name',
      });

      // Assert
      expect(users).toMatchObject([
        { name: 'same-name' },
        { name: 'same-name' },
      ]);
    });

    it('creates many entities with custom and transient parameters', async () => {
      // Arrange
      const userAttributes = buildUserAttributes();
      const userFactoryWithTransientParams = FactoryGirl.define(
        plainObject<User>(),
        ({ transientParams }) => ({
          ...userAttributes,
          email: transientParams?.companyUser
            ? 'user@company.com'
            : userAttributes.email,
        }),
      );

      // Act
      const users = await userFactoryWithTransientParams.createMany(
        2,
        [
          {
            name: 'Jane Doe',
          },
          {
            address: {
              number: 456,
            },
          },
        ],
        {
          companyUser: true,
        },
      );

      // Assert
      expect(users).toEqual([
        {
          ...userAttributes,
          name: 'Jane Doe',
          email: 'user@company.com',
        },
        {
          ...userAttributes,
          address: {
            ...userAttributes.address,
            number: 456,
          },
          email: 'user@company.com',
        },
      ]);
    });

    it('should create many with associated factory', async () => {
      // Arrange
      const addressFactory = FactoryGirl.define(plainObject<Address>(), () => {
        return {
          street: 'Main Street',
          number: FactoryGirl.sequence('number', (n) => n),
          city: 'New York',
        };
      });
      const userFactory = FactoryGirl.define(plainObject<User>(), () => {
        return {
          name: 'John Doe',
          email: FactoryGirl.sequence('email', (n) => `test-${n}@mail.com`),
          address: addressFactory.associate(),
        };
      });

      // Act
      const users = await userFactory.createMany(2);

      // Assert
      expect(users).toEqual([
        {
          name: 'John Doe',
          email: 'test-1@mail.com',
          address: {
            street: 'Main Street',
            number: 1,
            city: 'New York',
          },
        },
        {
          name: 'John Doe',
          email: 'test-2@mail.com',
          address: {
            street: 'Main Street',
            number: 2,
            city: 'New York',
          },
        },
      ]);
    });
  });

  describe('extend', () => {
    it('extends the factory with custom attributes', async () => {
      // Act
      const companyEmailUserFactory = userFactory.extend(() => ({
        email: 'user@company.com',
      }));

      // Assert
      await expect(companyEmailUserFactory.build()).resolves.toEqual({
        ...buildUserAttributes(),
        email: 'user@company.com',
      });
    });

    it('extends the factory with transient attributes', async () => {
      // Arrange
      type UserTransientParams = {
        email?: string;
      };

      // Act
      const companyEmailUserFactory = userFactory.extend<UserTransientParams>(
        ({ transientParams }) => ({
          email: transientParams?.email ?? '',
        }),
      );

      // Assert
      await expect(
        companyEmailUserFactory.build(
          {},
          {
            email: 'transient@mail.com',
          },
        ),
      ).resolves.toEqual({
        ...buildUserAttributes(),
        email: 'transient@mail.com',
      });
    });

    it('extends the factory with new attributes', async () => {
      // Act
      const companyEmailUserFactory = userFactory.extend(() => ({
        anotherAttribute: 'value',
      }));

      // Assert
      await expect(companyEmailUserFactory.build()).resolves.toEqual({
        ...buildUserAttributes(),
        anotherAttribute: 'value',
      });
    });

    it('extends the factory with async attributes', async () => {
      // Act
      const companyEmailUserFactory = userFactory.extend(async () => ({
        email: await Promise.resolve('user@company.com'),
      }));

      // Assert
      await expect(companyEmailUserFactory.build()).resolves.toEqual({
        ...buildUserAttributes(),
        email: 'user@company.com',
      });
    });
  });

  describe('associate', () => {
    it('should allow reusing an association', async () => {
      // Arrange
      type AddressWithUserData = {
        city: string;
        userEmail: number;
        userName: string;
      };
      const addressFactory = FactoryGirl.define(
        plainObject<AddressWithUserData>(),
        () => {
          const userAssociation = userFactory.associate();
          return {
            city: 'New York',
            userEmail: userAssociation.get('email'),
            userName: userAssociation.get('name'),
          };
        },
      );

      // Act
      const newAddress = await addressFactory.create();

      // Assert
      expect(newAddress).toEqual({
        city: 'New York',
        userEmail: 'user@mail.com',
        userName: 'John Doe',
      });
    });

    it('should allow specifying association attributes', async () => {
      // Arrange
      const userWithNewYorkCityFactory = userFactory.extend(() => ({
        address: addressFactory.associate({
          city: 'New York',
        }),
      }));
      // Act
      const newUser = await userWithNewYorkCityFactory.create();

      // Assert
      expect(newUser).toEqual({
        ...buildUserAttributes(),
        address: {
          ...buildAddressAttributes(),
          city: 'New York',
        },
      });
    });

    it('should allow specifying association attributes with key', async () => {
      // Arrange
      const addressWithCompanyUser = addressFactory.extend(() => ({
        userId: userFactory.associate('id', {
          email: 'john@company.com',
        }),
      }));
      // Act
      const newAddress = await addressWithCompanyUser.create();

      // Assert
      expect(newAddress).toEqual({
        ...buildAddressAttributes(),
        userId: expect.any(Number),
      });
    });
  });

  describe('mutate', () => {
    it('should allow mutating the return type of a factory (create)', async () => {
      // Arrange
      interface Employee {
        id: number;
        name: string;
        companyName: string;
      }
      const employeeFactory = userFactory.mutate<Employee>((user) => ({
        id: 1,
        name: user.name,
        companyName: 'ACME',
      }));

      // Act
      const employee = await employeeFactory.create();

      // Assert
      expect(employee).toEqual({
        id: 1,
        name: 'John Doe',
        companyName: 'ACME',
      });
    });
  });

  describe('with adapter', () => {
    it('always get the most up to date adapter instance', async () => {
      // Arrange
      FactoryGirl.setAdapter(new SequelizeAdapter());
      const userFactory = FactoryGirl.define(plainObject<User>(), () => {
        return {
          name: 'John Doe',
          email: '',
        };
      });
      FactoryGirl.setAdapter(new ObjectAdapter());

      // Act
      const user = await userFactory.build();

      // Assert
      expect(user).toBeTruthy();
    });
  });

  describe('hooks', () => {
    describe('afterBuild', () => {
      test('should modify the built entity', async () => {
        // Arrange
        const userFactoryExtended = userFactory.afterBuild((user) => {
          user.name = 'After Build Name';
          return user;
        });

        // Act
        const user = await userFactoryExtended.build();

        // Assert
        expect(user).toEqual({
          ...buildUserAttributes(),
          name: 'After Build Name',
        });
      });

      test('should modify the built entity with an async hook', async () => {
        // Arrange
        const userFactoryExtended = userFactory.afterBuild(async (user) => {
          user.name = await Promise.resolve('After Build Name');
          return user;
        });

        // Act
        const user = await userFactoryExtended.build();

        // Assert
        expect(user).toEqual({
          ...buildUserAttributes(),
          name: 'After Build Name',
        });
      });

      test('should modify the built entity with multiple hooks', async () => {
        // Arrange
        const extendedFactory = userFactory
          .afterBuild((user) => {
            user.name = 'After Build Name';
            return user;
          })
          .afterBuild(async (user) => {
            user.address.city = await Promise.resolve('After Build City');
            return user;
          });

        // Act
        const user = await extendedFactory.build();

        // Assert
        expect(user).toEqual({
          ...buildUserAttributes(),
          name: 'After Build Name',
          address: {
            ...buildAddressAttributes(),
            city: 'After Build City',
          },
        });
      });
    });
  });
});
