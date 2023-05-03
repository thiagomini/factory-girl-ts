import { FactoryGirl } from '@src/factory-girl';
import {
  Column,
  DataSource,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
  })
  name!: string;

  @Column({
    type: 'varchar',
  })
  email!: string;
}

@Entity()
class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
  })
  street!: string;

  @Column({
    type: 'varchar',
  })
  city!: string;

  @Column({
    type: 'varchar',
  })
  state!: string;

  @Column({
    type: 'varchar',
  })
  zip!: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user!: User;
}

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  synchronize: true,
  entities: [User],
});

describe('Typeorm integration', () => {
  it('authenticates', async () => {
    await expect(dataSource.initialize()).resolves.toBeTruthy();
  });

  it('builds a User model', () => {
    // Arrange
    const defaultAttributesFactory = () => ({
      id: 1,
      name: 'John',
      email: 'some-email@mail.com',
    });
    const userFactory = FactoryGirl.define(User, defaultAttributesFactory);

    // Act
    const user = userFactory.build();

    // Assert
    expect(user.id).toBe(1);
    expect(user.name).toBe('John');
    expect(user.email).toBe('some-email@mail.com');
  });

  it('builds a model with association', () => {
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
});
