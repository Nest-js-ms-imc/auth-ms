import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { InfraestructureModule } from './infraestructure/infraestructure.module';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      useGlobalPipes: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock('@nestjs/common', () => {
  const actualCommon = jest.requireActual('@nestjs/common');
  return {
    ...actualCommon,
    Logger: jest.fn().mockImplementation(() => ({
      log: jest.fn(),
    })),
  };
});

describe('bootstrap', () => {
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(() => {
    loggerMock = new Logger('auth-ms') as jest.Mocked<Logger>;
  });

  it('Should init correctly', async () => {
    const mockApp = await NestFactory.create(InfraestructureModule);

    await import('./main');

    expect(NestFactory.create).toHaveBeenCalledWith(InfraestructureModule);
    expect(mockApp.listen).toHaveBeenCalledWith(process.env.PORT);
  });
});
