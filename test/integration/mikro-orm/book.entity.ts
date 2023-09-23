export class BookEntity {
  public readonly id!: number;

  constructor(
    public readonly authorId: number,
    public readonly name: string,
  ) {}
}
