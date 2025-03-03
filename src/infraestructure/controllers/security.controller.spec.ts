import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './security.controller';
import { Application } from '../../application/application.interface';
import { PasswordHashService } from '../services/password-hash.service';
import { JwtService } from '../services/jwt.service';
import { UserService } from '../services/user.service';
import { RegisterUserDto, LoginUserDto } from '../../domain/dto';

describe('AuthController', () => {
  let authController: AuthController;
  let applicationMock: jest.Mocked<Application>;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let userServiceMock: jest.Mocked<UserService>;
  let passwordHashServiceMock: jest.Mocked<PasswordHashService>;

  beforeEach(async () => {
    applicationMock = {
      newUser: jest.fn().mockResolvedValue({ success: true }),
      login: jest.fn().mockResolvedValue({ token: 'mocked_token' }),
    } as any;

    jwtServiceMock = {} as any;
    userServiceMock = {} as any;
    passwordHashServiceMock = {} as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: Application, useValue: applicationMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: PasswordHashService, useValue: passwordHashServiceMock },
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
    );
    expect(result).toEqual({ token: 'mocked_token' });
  });

  it('should handle errors in loginUser', async () => {
    const loginDto: LoginUserDto = {
      email: 'john@example.com',
      password: 'securepassword',
    };

    const error = new Error('Login failed');
    applicationMock.login.mockRejectedValue(error);

    jest.spyOn(console, 'error').mockImplementation(() => {});

    await authController.loginUser(loginDto);

    expect(console.error).toHaveBeenCalledWith(error);
  });

  it('should handle errors in registerUser and log them', async () => {
    const registerDto: RegisterUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securepassword',
    };

    const error = new Error('User registration failed');
    applicationMock.newUser.mockRejectedValue(error);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await authController.registerUser(registerDto);

    expect(consoleErrorSpy).toHaveBeenCalledWith(error, registerDto);

    consoleErrorSpy.mockRestore();
  });
});
