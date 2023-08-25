export class UserEntity {
  public readonly id: number;
  public readonly name: string;
  public readonly email: string;
  public readonly phone?: string | null;

  public toString() {
    return `${this.name} <${this.email}>`;
  }

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}
