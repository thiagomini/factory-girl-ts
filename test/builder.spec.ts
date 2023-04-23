import { FactoryGirl } from "@src/factory-girl";

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

describe("Builder", () => {
  it("should build the given type with all properties", () => {
    // Arrange
    const userFactory = FactoryGirl.define<User>(() => {
      return {
        name: "John Doe",
        email: "test@mail.com",
        address: {
          street: "Main Street",
          number: 123,
          city: "New York",
        },
      };
    });

    // Act
    const user = userFactory.build();

    // Assert
    expect(user).toEqual({
      name: "John Doe",
      email: "test@mail.com",
      address: {
        street: "Main Street",
        number: 123,
        city: "New York",
      },
    });
  });

  it("should build with deep merged partial properties", () => {
    // Arrange
    const userFactory = FactoryGirl.define<User>(() => {
      return {
        name: "John Doe",
        email: "test@mail.com",
        address: {
          street: "Main Street",
          number: 123,
          city: "New York",
        },
      };
    });

    // Act
    const user = userFactory.build({
      name: "Jane Doe",
      address: {
        number: 456,
      },
    });

    // Assert
    expect(user).toEqual({
      name: "Jane Doe",
      email: "test@mail.com",
      address: {
        street: "Main Street",
        number: 456,
        city: "New York",
      },
    });
  });

  it("should build with associated factory", () => {
    // Arrange
    const addressFactory = FactoryGirl.define<Address>(() => {
      return {
        street: "Main Street",
        number: 123,
        city: "New York",
      };
    });
    const userFactory = FactoryGirl.define<User>(() => {
      return {
        name: "John Doe",
        email: "test@mail.com",
        address: addressFactory.associate(),
      };
    });

    // Act
    const user = userFactory.build();

    // Assert
    expect(user).toEqual({
      name: "John Doe",
      email: "test@mail.com",
      address: {
        street: "Main Street",
        number: 123,
        city: "New York",
      },
    });
  });
});
