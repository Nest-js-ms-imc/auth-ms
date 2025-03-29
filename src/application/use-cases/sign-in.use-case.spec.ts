import { jest } from '@jest/globals';

import { SignInUseCase } from './sign-in.use-case';
import { Domain } from 'src/domain/domain.interface';
import { IUserDomainService } from 'src/domain/services/user.service';
import { IPasswordHashDomainService } from 'src/domain/services/password-hash.service';
import { IUserRepository } from 'src/application/persistence/repositories/user.repository';
import { IJwtApplicationService } from 'src/application/service/jwt.service';
import { IUserModel } from 'src/application/persistence/models/user.model';
import { SignInApplicationDto } from 'src/application/dto';
import { UseCaseException } from '../exceptions/use-case.exception';

describe('SignInUseCase', () => {
  let signInUseCase: SignInUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository<IUserModel>>;
  let mockDomainController: jest.Mocked<Domain>;
  let mockJwtService: jest.Mocked<IJwtApplicationService>;
  let mockUserService: jest.Mocked<IUserDomainService>;
  let mockPasswordHashService: jest.Mocked<IPasswordHashDomainService>;

  beforeEach(() => {
    mockUserRepository = {
      registerUser: jest.fn(),
      loginUser: jest.fn(),
      findByEmail: jest.fn(),
      deleteUser: jest.fn(),
    } as jest.Mocked<IUserRepository<IUserModel>>;

    mockDomainController = {
      createUser: jest.fn(),
      signIn: jest.fn(),
      verifyToken: jest.fn(),
    } as jest.Mocked<Domain>;

    mockJwtService = {
      generateToken: jest.fn(() => 'mocked_token'),
      verifyToken: jest.fn(),
    } as jest.Mocked<IJwtApplicationService>;

    mockUserService = {
      getUserById: jest.fn(),
      validateUserAndPassword: jest.fn(),
    } as jest.Mocked<IUserDomainService>;

    mockPasswordHashService = {
      hash: jest.fn((password) => `hashed_${password}`),
      compare: jest.fn((password, hash) => password === hash),
    } as jest.Mocked<IPasswordHashDomainService>;

    signInUseCase = new SignInUseCase(
      mockUserRepository,
      mockDomainController,
      mockJwtService,
      mockUserService,
      mockPasswordHashService,
    );
  });

  it('should sign in successfully and return a token', async () => {
    const signInDto: SignInApplicationDto = {
      email: 'test@example.com',
      password: '123456',
    };

    const userModel: IUserModel = {
      id: '1',
      email: signInDto.email,
      name: 'Test User',
      password: 'hashed_123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockDomainController.signIn.mockResolvedValue(true);
    mockUserRepository.findByEmail.mockResolvedValue(userModel);
    mockJwtService.generateToken.mockReturnValue('mocked_token');

    const result = await signInUseCase.execute(signInDto);

    expect(mockDomainController.signIn).toHaveBeenCalledWith(
      signInDto.email,
      signInDto.password,
      mockUserService,
      mockPasswordHashService,
    );

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      signInDto.email,
    );
    expect(mockJwtService.generateToken).toHaveBeenCalledWith({
      id: userModel.id,
      email: userModel.email,
      name: userModel.name,
    });

    expect(result).toEqual({ token: 'mocked_token' });
  });

  it('should throw UseCaseException if signIn fails', async () => {
    const signInDto: SignInApplicationDto = {
      email: 'test@example.com',
      password: 'wrong_password',
    };

    mockDomainController.signIn.mockResolvedValue(false);

    await expect(signInUseCase.execute(signInDto)).rejects.toThrow(
      UseCaseException,
    );
    await expect(signInUseCase.execute(signInDto)).rejects.toThrow(
      'Invalid email or password',
    );

    expect(mockDomainController.signIn).toHaveBeenCalled();
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockJwtService.generateToken).not.toHaveBeenCalled();
  });

  it('should throw UseCaseException if user is not found in database', async () => {
    const signInDto: SignInApplicationDto = {
      email: 'test@example.com',
      password: '123456',
    };

    mockDomainController.signIn.mockResolvedValue(true);
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(signInUseCase.execute(signInDto)).rejects.toThrow(
      UseCaseException,
    );
    await expect(signInUseCase.execute(signInDto)).rejects.toThrow(
      'Invalid email or password',
    );

    expect(mockDomainController.signIn).toHaveBeenCalled();
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      signInDto.email,
    );
    expect(mockJwtService.generateToken).not.toHaveBeenCalled();
  });
});
