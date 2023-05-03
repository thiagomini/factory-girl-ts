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
});
