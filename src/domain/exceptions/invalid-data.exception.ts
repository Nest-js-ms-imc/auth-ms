export class InvalidDataException extends Error {
  errors: Map<string, boolean>;
  constructor(message: string, errors: Map<string, boolean>) {
    super(message);
    this.errors = errors;
    this.name = 'InvalidDataException';
  }
}
