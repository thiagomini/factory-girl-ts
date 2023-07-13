export class PhoneNumber {
  public readonly value: string;

  constructor(number: string) {
    if (!number) {
      throw new Error('Phone number is required');
    }
    this.value = number;
  }
}
