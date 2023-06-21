import { FactoryGirl } from '@src/factory-girl';
import { plainObject } from '@src/utils';

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
  describe('build', () => {
    it('should build the given type with all properties', () => {
      // Arrange
      const userFactory = FactoryGirl.define(plainObject<User>(), () => {
        return {
          name: 'John Doe',
          email: 'test@mail.com',
          address: {
            street: 'Main Street',
            number: 123,
            city: 'New York',
          },
        };
      });

      // Act
      const user = userFactory.build();

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

    it('should build with deep merged partial properties', () => {
      // Arrange
      const userFactory = FactoryGirl.define(plainObject<User>(), () => {
        return {
          name: 'John Doe',
          email: 'test@mail.com',
          address: {
            street: 'Main Street',
            number: 123,
            city: 'New York',
          },
        };
      });

      // Act
      const user = userFactory.build({
        name: 'Jane Doe',
        address: {
          number: 456,
        },
      });

      // Assert
      expect(user).toEqual({
        name: 'Jane Doe',
        email: 'test@mail.com',
        address: {
          street: 'Main Street',
          number: 456,
          city: 'New York',
        },
      });
    });

    it('should build with associated factory', () => {
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
      const user = userFactory.build();

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

    it('builds with transient parameters', () => {
      // Arrange
      type UserTransientParams = {
        companyUser: boolean;
      };
      const userAttributes = buildUserAttributes();

      const userFactory = FactoryGirl.define<User, UserTransientParams>(
        plainObject<User>(),
        ({ transientParams }) => {
          return {
            ...userAttributes,
            email: transientParams?.companyUser
              ? 'user@company.com'
              : userAttributes.email,
          };
        },
      );

      // Act
      const user = userFactory.build({}, { companyUser: true });

      // Assert
      expect(user).toEqual({
        ...userAttributes,
        email: 'user@company.com',
      });
    });

    it('should build with sequence', () => {
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
      const user = userFactory.build();

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
  });

  describe('buildMany', () => {
    it('should build many entities', () => {
      // Arrange
      const userAttributes = buildUserAttributes();
      const userFactory = FactoryGirl.define(
        plainObject<User>(),
        () => userAttributes,
      );

      // Act
      const users = userFactory.buildMany(2);

      // Assert
      expect(users).toEqual([userAttributes, userAttributes]);
    });

    it('should build many entities with given properties', () => {
      // Arrange
      const userAttributes = buildUserAttributes();
      const userFactory = FactoryGirl.define(
        plainObject<User>(),
        () => userAttributes,
      );

      // Act
      const users = userFactory.buildMany(2, [
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

    it('should build many entities with the same properties', () => {
      // Arrange
      const userAttributes = buildUserAttributes();
      const userFactory = FactoryGirl.define(
        plainObject<User>(),
        () => userAttributes,
      );

      // Act
      const users = userFactory.buildMany(2, {
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

    it('should build many entities with sequences', () => {
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
      const users = userFactory.buildMany(10);

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
        UserTransientParams
      >(plainObject<User>(), ({ transientParams }) => {
        return {
          ...userAttributes,
          email: transientParams?.companyUser
            ? 'user@company.com'
            : userAttributes.email,
        };
      });

      it('builds with transient parameters', () => {
        // Act
        const users = userFactoryWithTransient.buildMany(2, undefined, {
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

      it('builds with custom and transient parameters', () => {
        // Act
        const users = userFactoryWithTransient.buildMany(
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

      it('builds with array of custom parameters AND transient parameters', () => {
        // Act
        const users = userFactoryWithTransient.buildMany(
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
      const userFactory = FactoryGirl.define(
        plainObject<User>(),
        () => userAttributes,
      );

      // Act
      const user = await userFactory.create();

      // Assert
      expect(user).toEqual(userAttributes);
    });

    it('creates an entity with associations', async () => {
      // Arrange
      const userAttributes = buildUserAttributes();
      const userFactory = FactoryGirl.define(
        plainObject<User>(),
        () => userAttributes,
      );
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
      const userFactory = FactoryGirl.define(
        plainObject<User>(),
        () => userAttributes,
      );

      // Act
      const users = await userFactory.createMany(2);

      // Assert
      expect(users).toEqual([userAttributes, userAttributes]);
    });

    it('creates many entities with the same props', async () => {
      // Arrange
      const userAttributes = buildUserAttributes();
      const userFactory = FactoryGirl.define(
        plainObject<User>(),
        () => userAttributes,
      );

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

    it('creates many entities custom and transient parameters', async () => {
      // Arrange
      const userAttributes = buildUserAttributes();
      const userFactory = FactoryGirl.define(
        plainObject<User>(),
        ({ transientParams }) => ({
          ...userAttributes,
          email: transientParams?.companyUser
            ? 'user@company.com'
            : userAttributes.email,
        }),
      );

      // Act
      const users = await userFactory.createMany(
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
  });

  describe('extend', () => {
    it('extends the factory with new attributes', () => {
      // Arrange
      const userFactory = FactoryGirl.define(
        plainObject<User>(),
        buildUserAttributes,
      );

      // Act
      const companyEmailUserFactory = userFactory.extend(() => ({
        email: 'user@company.com',
      }));

      // Assert
      expect(companyEmailUserFactory.build()).toEqual({
        ...buildUserAttributes(),
        email: 'user@company.com',
      });
    });

    it('extends the factory with transient attributes', () => {
      // Arrange
      type UserTransientParams = {
        email?: string;
      };

      const userFactory = FactoryGirl.define<User, UserTransientParams>(
        plainObject<User>(),
        buildUserAttributes,
      );

      // Act
      const companyEmailUserFactory = userFactory.extend(
        ({ transientParams }) => ({
          email: transientParams?.email ?? '',
        }),
      );

      // Assert
      expect(
        companyEmailUserFactory.build(
          {},
          {
            email: 'transient@mail.com',
          },
        ),
      ).toEqual({
        ...buildUserAttributes(),
        email: 'transient@mail.com',
      });
    });
  });
});
