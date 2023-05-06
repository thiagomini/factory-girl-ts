import { TypeOrmRepositoryAdapter } from '@src/adapters/typeorm.adapter';
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
  entities: [User, Address],
});

describe('Typeorm integration', () => {
  beforeAll(async () => {
    await dataSource.initialize();
    await dataSource.getRepository(Address).delete({});
    await dataSource.getRepository(User).delete({});
  });

  beforeEach(() => {
    FactoryGirl.setAdapter(new TypeOrmRepositoryAdapter(dataSource));
  });

  describe('Repository pattern', () => {
    const generateUserDefaultAttributes = () => ({
      id: 1,
      name: 'John',
      email: 'some-email@mail.com',
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
      });
      expect(userInDatabase).toEqual({
        id: expect.any(Number),
        name: 'John',
        email: 'some-email@mail.com',
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
        user: {
          id: expect.any(Number),
          name: 'John',
          email: 'some-email@mail.com',
        },
      });
      expect(addressInDatabase).toBeTruthy();
      expect(addressInDatabase.user).toBeTruthy();
    });
  });
});
