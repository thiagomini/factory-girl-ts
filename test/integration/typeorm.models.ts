import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
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
export class Address {
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

@Entity()
export class UserActiveRecord extends BaseEntity {
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
export class AddressActiveRecord extends BaseEntity {
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
