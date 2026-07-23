export class Email {
  private constructor(private readonly value: string) {}

  public static create(rawValue: string): Email {
    const normalized = rawValue.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error("Invalid email address");
    }

    return new Email(normalized);
  }

  public toString(): string {
    return this.value;
  }
}
