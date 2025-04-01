import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';

import { RedisService } from './redis.service';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  }));
});

describe('RedisService', () => {
  let service: RedisService;
  let redisMock: jest.Mocked<Redis>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
    redisMock = (service as any).client;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('set', () => {
    it('should set a key with a value and TTL', async () => {
      await service.set('test-key', 'test-value', 3600);
      expect(redisMock.set).toHaveBeenCalledWith(
        'test-key',
        'test-value',
        'EX',
        3600,
      );
    });
  });

  describe('get', () => {
    it('should get a value by key', async () => {
      redisMock.get.mockResolvedValue('test-value');
      const result = await service.get('test-key');
      expect(result).toBe('test-value');
      expect(redisMock.get).toHaveBeenCalledWith('test-key');
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      await service.del('test-key');
      expect(redisMock.del).toHaveBeenCalledWith('test-key');
    });
  });
});
