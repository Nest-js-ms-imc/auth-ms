import { Test, TestingModule } from '@nestjs/testing';
import { JwtService as JwTokenService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

import { JwtService } from './jwt.service';
import { EnvsService } from '../secrets/envs.service';
import { UserApplicationDto } from '../../application/dto';

describe('JwtService', () => {
  let jwtService: JwtService;
  let jwtTokenService: JwTokenService;
  let envsService: EnvsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
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
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    jwtTokenService = module.get<JwTokenService>(JwTokenService);
    envsService = module.get<EnvsService>(EnvsService);
  });

  it('debería estar definido', () => {
    expect(jwtService).toBeDefined();
  });

  it('debería generar un token JWT', () => {
    const payload = { email: 'test@example.com', name: 'Test User', id: '123' };

    const token = jwtService.generateToken(payload);

    expect(jwtTokenService.sign).toHaveBeenCalledWith(payload);
    expect(token).toBe('mocked-jwt-token');
  });

  it('debería verificar un token JWT correctamente', () => {
    const payload: UserApplicationDto = {
      email: 'test@example.com',
      name: 'Test User',
      id: '123',
      password: 'hashed-password',
    };

    jest.spyOn(jwtTokenService, 'verify').mockReturnValue(payload);

    const verified = jwtService.verifyToken('valid-token');

    expect(envsService.get).toHaveBeenCalledWith('JWT_SECRET');
    expect(jwtTokenService.verify).toHaveBeenCalledWith('valid-token', {
      secret: 'mocked-secret-key',
    });

    expect(verified).toEqual({
      user: { email: 'test@example.com', name: 'Test User', id: '123' },
      token: 'mocked-jwt-token',
    });
  });

  it('debería lanzar una excepción si el token es inválido', () => {
    jest.spyOn(jwtTokenService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => jwtService.verifyToken('invalid-token')).toThrow(RpcException);
  });
});
