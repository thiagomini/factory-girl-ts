import { FactoryGirl } from '@src/factory-girl';
import { Column, DataSource, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
});
