import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidDataException extends HttpException {
  constructor(message: string, errors: Map<string, boolean>) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errors: Object.fromEntries(errors),
        name: 'InvalidDataException',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
