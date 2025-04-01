import { Test, TestingModule } from '@nestjs/testing';
import { JwtService as JwTokenService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

import { JwtService } from './jwt.service';
import { EnvsService } from '../secrets';
import { UserApplicationDto } from '../../application/dto';
import { RedisService } from './redis.service';

describe('JwtService', () => {
  let jwtService: JwtService;
  let jwtTokenService: JwTokenService;
  let envsService: EnvsService;
  let redisMock: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        RedisService,
        {
          provide: JwTokenService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: EnvsService,
          useValue: {
            get: jest.fn().mockReturnValue('mocked-secret-key'),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    jwtTokenService = module.get<JwTokenService>(JwTokenService);
    envsService = module.get<EnvsService>(EnvsService);
    redisMock = module.get<RedisService>(
      RedisService,
    ) as jest.Mocked<RedisService>;
  });

  it('should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  it('should generate a JWT token', () => {
    const payload = { email: 'test@example.com', name: 'Test User', id: '123' };

    const token = jwtService.generateToken(payload);

    expect(jwtTokenService.sign).toHaveBeenCalledWith(payload);
    expect(token).toBe('mocked-jwt-token');
  });

  it('should verify a JWT token correctly', async () => {
    const payload: UserApplicationDto = {
      email: 'test@example.com',
      name: 'Test User',
      id: '123',
      password: 'hashed-password',
    };

    jest.spyOn(jwtTokenService, 'verify').mockReturnValue(payload);

    const verified = await jwtService.verifyToken('valid-token');

    expect(verified).toEqual({
      user: { email: 'test@example.com', name: 'Test User', id: '123' },
      token: 'mocked-jwt-token',
    });
  });

  it('should throw an exception if the token is invalid', () => {
    jest.spyOn(jwtTokenService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });
  });

  it('should throw RpcException if token is blacklisted', async () => {
    redisMock.get.mockResolvedValue('revoked');

    await expect(jwtService.verifyToken('blacklisted-token')).rejects.toThrow(
      RpcException,
    );
    await expect(jwtService.verifyToken('blacklisted-token')).rejects.toEqual(
      new RpcException({ status: 401, message: 'Invalid token' }),
    );
  });

  it('should throw RpcException if token verification fails', async () => {
    redisMock.get.mockResolvedValue(null);
    (envsService.get as jest.Mock).mockReturnValue('secret-key');
    jest.spyOn(jwtTokenService, 'verify').mockImplementation(() => {
      throw new Error();
    });

    await expect(jwtService.verifyToken('invalid-token')).rejects.toThrow(
      RpcException,
    );
    await expect(jwtService.verifyToken('invalid-token')).rejects.toEqual(
      new RpcException({ status: 401, message: 'Invalid token' }),
    );
  });
});
