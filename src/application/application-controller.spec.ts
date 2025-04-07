import { ApplicationController } from './application.controller';
import { IUserModel } from './persistence/models/user.model';
import { IUserRepository } from './persistence/repositories/user.repository';
import { IJwtApplicationService } from './service/jwt.service';
import { Domain } from '../domain/domain.interface';
import {
  LogOutUseCase,
  NewUserUseCase,
  SignInUseCase,
  VerifyTokenUseCase,
} from './use-cases';
import {
  IPasswordHashDomainService,
  IUserDomainService,
} from '../domain/services';
import { RedisService } from '@/infraestructure/services';

jest.mock('./use-cases/new-user.use-case');
jest.mock('./use-cases/sign-in.use-case');
jest.mock('./use-cases/verify-token.use-case');
jest.mock('./use-cases/logout.use-case');

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let mockUserRepository: jest.Mocked<IUserRepository<IUserModel>>;
  let mockDomainController: jest.Mocked<Domain>;
  let mockPasswordHashService: jest.Mocked<IPasswordHashDomainService>;
  let mockJwtService: jest.Mocked<IJwtApplicationService>;
  let mockUserService: jest.Mocked<IUserDomainService>;
  let mockRedisService: jest.Mocked<RedisService>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository<IUserModel>>;

    mockDomainController = {} as jest.Mocked<Domain>;
    mockPasswordHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as jest.Mocked<IPasswordHashDomainService>;
    mockJwtService = {
      sign: jest.fn(),
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    } as jest.Mocked<IJwtApplicationService>;
    mockUserService = {} as jest.Mocked<IUserDomainService>;
    mockRedisService = {
      del: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      client: jest.fn() as unknown,
    } as unknown as jest.Mocked<RedisService>;

    controller = new ApplicationController(
      mockUserRepository,
      mockDomainController,
    );
  });

  describe('newUser', () => {
    it('should create a new user', async () => {
      const mockUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
      };
      const mockResponse = { id: '1', ...mockUserDto };

      (NewUserUseCase.prototype.execute as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await controller.newUser(
        mockUserDto.name,
        mockUserDto.email,
        mockUserDto.password,
        mockPasswordHashService,
      );

      expect(NewUserUseCase).toHaveBeenCalledWith(
        mockUserRepository,
        mockDomainController,
        mockPasswordHashService,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if NewUserUseCase fails', async () => {
      (NewUserUseCase.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('User creation failed'),
      );

      await expect(
        controller.newUser(
          'Test User',
          'test@example.com',
          '123456',
          mockPasswordHashService,
        ),
      ).rejects.toThrow('User creation failed');
    });
  });

  describe('login', () => {
    it('should return a valid token', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = '123456';
      const mockToken = 'mocked-jwt-token';

      (SignInUseCase.prototype.execute as jest.Mock).mockResolvedValue({
        token: mockToken,
      });

      const result = await controller.login(
        mockEmail,
        mockPassword,
        mockJwtService,
        mockUserService,
        mockPasswordHashService,
        mockRedisService,
      );

      expect(SignInUseCase).toHaveBeenCalledWith(
        mockUserRepository,
        mockDomainController,
        mockJwtService,
        mockUserService,
        mockPasswordHashService,
        mockRedisService,
      );
      expect(result).toBe(mockToken);
    });

    it('should throw an error if SignInUseCase fails', async () => {
      (SignInUseCase.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(
        controller.login(
          'test@example.com',
          '123456',
          mockJwtService,
          mockUserService,
          mockPasswordHashService,
          mockRedisService,
        ),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should return a verify token', async () => {
      const mockId = '01';
      const mockEmail = 'test@example.com';
      const mockName = 'Test user';
      const mockToken = 'mocked-jwt-token';

      (VerifyTokenUseCase.prototype.execute as jest.Mock).mockResolvedValue({
        user: {
          id: mockId,
          email: mockEmail,
          name: mockName,
        },
      });

      const result = await controller.verifyToken(mockToken, mockJwtService);

      expect(VerifyTokenUseCase).toHaveBeenCalledWith(mockJwtService);
      expect(result).toStrictEqual({
        email: mockEmail,
        id: mockId,
        name: mockName,
      });
    });

    it('should return a verify token without data', async () => {
      const mockId = undefined;
      const mockEmail = undefined;
      const mockName = undefined;
      const mockToken = 'mocked-jwt-token';

      (VerifyTokenUseCase.prototype.execute as jest.Mock).mockResolvedValue({
        user: {
          id: mockId,
          email: mockEmail,
          name: mockName,
        },
        token: undefined,
      });

      const result = await controller.verifyToken(mockToken, mockJwtService);

      expect(VerifyTokenUseCase).toHaveBeenCalledWith(mockJwtService);
    });

    it('should throw an error if VerifyTokenUseCase fails', async () => {
      (VerifyTokenUseCase.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(
        controller.login(
          'test@example.com',
          '123456',
          mockJwtService,
          mockUserService,
          mockPasswordHashService,
          mockRedisService,
        ),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should sign out correctly', async () => {
      const mockToken = 'mocked-jwt-token';

      (LogOutUseCase.prototype.execute as jest.Mock).mockResolvedValue(true);

      const result = await controller.logOut(mockToken);

      // expect(LogOutUseCase).toHaveBeenCalledWith(mockJwtService);
      expect(result).toStrictEqual(true);
    });
  });
});
