import { FactoryGirl } from "@src/factory-girl";

describe("Builder", () => {
  it("should build the given type with all properties", () => {
    // Arrange
    type User = {
      name: string;
      email: string;
      address: {
        street: string;
        number: number;
        city: string;
      };
    };
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
});
