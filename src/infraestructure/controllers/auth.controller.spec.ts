import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { Application } from '../../application/application.interface';
import {
  JwtService,
  PasswordHashService,
  RedisService,
  UserService,
} from '../services';
import {
  RegisterUserDto,
  LoginUserDto,
  VerifyTokenDto,
  LogOutUserDto,
} from '../../domain/dto';

describe('AuthController', () => {
  let authController: AuthController;
  let applicationMock: jest.Mocked<Application>;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let userServiceMock: jest.Mocked<UserService>;
  let passwordHashServiceMock: jest.Mocked<PasswordHashService>;
  let redisServiceMock: jest.Mocked<RedisService>;

  beforeEach(async () => {
    applicationMock = {
      newUser: jest.fn().mockResolvedValue({ success: true }),
      login: jest.fn().mockResolvedValue({ token: 'mocked_token' }),
      logOut: jest.fn(),
      verifyToken: jest.fn().mockResolvedValue(true),
    } as any;

    jwtServiceMock = {} as any;
    userServiceMock = {} as any;
    passwordHashServiceMock = {} as any;
    redisServiceMock = {} as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: Application, useValue: applicationMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: PasswordHashService, useValue: passwordHashServiceMock },
        { provide: RedisService, useValue: redisServiceMock },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should register a user', async () => {
    const dto: RegisterUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };
    const result = await authController.registerUser(dto);

    expect(applicationMock.newUser).toHaveBeenCalledWith(
      dto.name,
      dto.email,
      dto.password,
      passwordHashServiceMock,
    );
    expect(result).toEqual({ success: true });
  });

  it('should login a user', async () => {
    const dto: LoginUserDto = {
      email: 'john@example.com',
      password: 'password123',
    };
    const result = await authController.loginUser(dto);

    expect(applicationMock.login).toHaveBeenCalledWith(
      dto.email,
      dto.password,
      jwtServiceMock,
      userServiceMock,
      passwordHashServiceMock,
      redisServiceMock,
    );
    expect(result).toEqual({ token: 'mocked_token' });
  });

  it('should verify a token', async () => {
    const dto: VerifyTokenDto = { token: 'jwt-token' };
    const result = { id: '123', name: 'John Doe', email: 'user@example.com' };
    jest.spyOn(applicationMock, 'verifyToken').mockResolvedValue(result);

    expect(await authController.verifyToken(dto)).toEqual(result);
    expect(applicationMock.verifyToken).toHaveBeenCalledWith(
      dto.token,
      jwtServiceMock,
    );
  });

  it('should logout a user with error', async () => {
    const dto: LogOutUserDto = { token: 'jwt-token' };

    const result = await authController.logout(dto);

    expect(await authController.logout(dto)).toEqual(undefined);
  });
});
