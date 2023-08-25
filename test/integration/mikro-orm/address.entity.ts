import { UserEntity } from './user.entity';

export class AddressEntity {
  public readonly id: number;
  public readonly city: string;
  public readonly user: UserEntity;

  constructor(id: number, city: string, user: UserEntity) {
    this.id = id;
    this.city = city;
    this.user = user;
  }
}
