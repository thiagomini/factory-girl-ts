import { Association, Builder } from '@src/index';

type User = {
  name: string;
  email: string;
  age: number;
};

describe('Association', () => {
  it('builds the associated entity', () => {
    // Arrange
    const builder: Builder<User> = {
      build: () => ({
        name: 'John Doe',
        email: 'test@mail.com',
        age: 20,
      }),
    };
    const association = new Association<User>(builder);

    // Act
    const user = association.build();

    // Assert
    expect(user).toEqual({
      name: 'John Doe',
      email: 'test@mail.com',
      age: 20,
    });
  });

  it('returns the associated entity attribute', () => {
    // Arrange
    const builder: Builder<User> = {
      build: () => ({
        name: 'John Doe',
        email: 'test@mail.com',
        age: 20,
      }),
    };
    const association = new Association<User>(builder, 'name');

    // Act
    const userName = association.build();

    // Assert
    expect(userName).toBe('John Doe');
  });
});
