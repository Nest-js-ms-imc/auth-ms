import { UseCaseException } from './use-case.exception';

describe('UseCaseException', () => {
  it('should create an instance of UseCaseException with the correct message', () => {
    const message = 'Test exception message';
    const exception = new UseCaseException(message);

    expect(exception).toBeInstanceOf(UseCaseException);
    expect(exception.message).toBe(message);
    expect(exception.name).toBe('UseCaseException');
  });

  it('should have Error as its prototype', () => {
    const exception = new UseCaseException('Another test message');

    expect(exception).toBeInstanceOf(Error);
    expect(Object.getPrototypeOf(exception)).toBeInstanceOf(Error);
  });
});
