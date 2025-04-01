import { InvalidDataException } from './invalid-data.exception';

describe('InvalidDataException', () => {
  it('should create an instance of InvalidDataException with the correct message', () => {
    const message = 'Test exception message';
    const exception = new InvalidDataException(
      message,
      new Map<string, boolean>(),
    );

    expect(exception).toBeInstanceOf(InvalidDataException);
    expect(exception.message).toBe(message);
    expect(exception.name).toBe('InvalidDataException');
  });

  it('should have Error as its prototype', () => {
    const exception = new InvalidDataException(
      'Another test message',
      new Map<string, boolean>(),
    );

    expect(exception).toBeInstanceOf(Error);
    expect(Object.getPrototypeOf(exception)).toBeInstanceOf(Error);
  });
});
