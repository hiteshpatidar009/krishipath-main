export abstract class BaseValidator<TInput> {
  public abstract validate(input: TInput): void;
}
