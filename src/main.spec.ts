import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';

import { InfraestructureModule } from './infraestructure/infraestructure.module';
import { EnvsService } from './infraestructure/secrets/envs.service';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('bootstrap', () => {
  let mockApp: jest.Mocked<INestApplication>;
  let mockEnvsService: Partial<EnvsService>;

  beforeEach(() => {
    mockApp = {
      get: jest.fn(() => mockEnvsService),
      useGlobalPipes: jest.fn(() => {}),
      listen: jest.fn(async () => {}),
    } as unknown as jest.Mocked<INestApplication>;

    mockEnvsService = {
      get: jest.fn().mockReturnValue('3000'),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    mockApp.get.mockReturnValue(mockEnvsService);
  });

  it('should initialize the application and listen on the correct port', async () => {
    await import('./main');

    expect(NestFactory.create).toHaveBeenCalledWith(InfraestructureModule);
    expect(mockApp.get).toHaveBeenCalledWith(EnvsService);
    expect(mockApp.listen).toHaveBeenCalledWith('3000');
  });

  it('should handle errors during initialization', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => {
        throw new Error('Process exit called');
      });

    (NestFactory.create as jest.Mock).mockRejectedValue(
      new Error('Initialization failed'),
    );

    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });
});
