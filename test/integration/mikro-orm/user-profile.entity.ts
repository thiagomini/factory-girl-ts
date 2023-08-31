export class UserProfileEntity {
  public readonly id!: number;
  public readonly userId: number;
  public readonly email: string;
  public readonly photo?: string;

  constructor(userId: number, email: string, photo?: string) {
    this.userId = userId;
    this.email = email;
    this.photo = photo;
  }
}
