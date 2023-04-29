import { FactoryGirl } from '@src/factory-girl';

type User = {
  name: string;
  email: string;
  address: Address;
};

type Address = {
  street: string;
  number: number;
  city: string;
};

function buildUserAttributes(): User {
  return {
    name: 'John Doe',
    email: 'user@mail.com',
    address: {
      street: 'Main Street',
      number: 123,
      city: 'New York',
    },
  };
}

describe('Builder', () => {
  it('should build the given type with all properties', () => {
    // Arrange
    const userFactory = FactoryGirl.define<User>(() => {
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
    const userFactory = FactoryGirl.define<User>(() => {
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
    const addressFactory = FactoryGirl.define<Address>(() => {
      return {
        street: 'Main Street',
        number: 123,
        city: 'New York',
      };
    });
    const userFactory = FactoryGirl.define<User>(() => {
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
});

describe('BuilderMany', () => {
  it('should build many entities', () => {
    // Arrange
    const userAttributes = buildUserAttributes();
    const userFactory = FactoryGirl.define<User>(() => userAttributes);

    // Act
    const users = userFactory.buildMany(2);

    // Assert
    expect(users).toEqual([userAttributes, userAttributes]);
  });

  it('should build many entities with given properties', () => {
    // Arrange
    const userAttributes = buildUserAttributes();
    const userFactory = FactoryGirl.define<User>(() => userAttributes);

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
    const userFactory = FactoryGirl.define<User>(() => userAttributes);

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

  describe('when using transient params', () => {
    type UserTransientParams = {
      companyUser: boolean;
    };
    const userAttributes = buildUserAttributes();

    const userFactoryWithTransient = FactoryGirl.define<
      User,
      UserTransientParams
    >(({ transientParams }) => {
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
