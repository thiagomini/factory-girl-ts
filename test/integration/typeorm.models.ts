import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PhoneNumber } from './phone.value';

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

  @Column({
    type: 'varchar',
    nullable: true,
    transformer: {
      to: (phoneNumber: PhoneNumber) => phoneNumber?.value,
      from: (phoneNumber: string) =>
        phoneNumber && new PhoneNumber(phoneNumber),
    },
  })
  phoneNumber?: PhoneNumber;
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

  @Column({
    type: 'varchar',
    nullable: true,
    transformer: {
      to: (phoneNumber: PhoneNumber) => phoneNumber?.value,
      from: (phoneNumber: string) =>
        phoneNumber && new PhoneNumber(phoneNumber),
    },
  })
  phoneNumber?: PhoneNumber;
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

  @ManyToOne(() => UserActiveRecord, (user) => user.id)
  @JoinColumn()
  user!: UserActiveRecord;
}
