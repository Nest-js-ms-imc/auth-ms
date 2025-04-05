import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { EnvsService } from './infraestructure/secrets/envs.service';
import { InfraestructureModule } from './infraestructure/infraestructure.module';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
    createMicroservice: jest.fn(),
  },
}));

describe('bootstrap', () => {
  const mockListen = jest.fn();
  const mockUseGlobalPipes = jest.fn();
  const mockGet = jest.fn();

  const mockEnvsService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        NATS_SERVERS: 'nats://localhost:4222,nats://localhost:4223',
        PORT: '3000',
      };
      return values[key];
    }),
  };

  const mockApp = {
    get: mockGet,
    listen: mockListen,
    useGlobalPipes: mockUseGlobalPipes,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (NestFactory.create as jest.Mock).mockResolvedValue({
      get: () => mockEnvsService,
    });

    (NestFactory.createMicroservice as jest.Mock).mockReturnValue(mockApp);

    mockGet.mockImplementation((service: unknown) => {
      if (service === EnvsService) return mockEnvsService;
    });
  });

  it('should start the microservice and call listen()', async () => {
    await import('./main');

    expect(NestFactory.create).toHaveBeenCalledWith(InfraestructureModule);
    expect(mockEnvsService.get).toHaveBeenCalledWith('NATS_SERVERS');
  });
});
