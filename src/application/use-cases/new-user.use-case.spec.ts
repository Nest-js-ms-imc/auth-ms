import { NewUserUseCase } from './new-user.use-case';
import { Domain } from 'src/domain/domain.interface';
import { CreateUserDomainDto } from '../../domain/dto/create-user.dto';
import { IPasswordHashDomainService } from 'src/domain/services/password-hash.service';
import { UserApplicationDto } from '../dto/user.dto';
import { IUserModel } from '../persistence/models/user.model';
import { IUserRepository } from '../persistence/repositories/user.repository';
import { NewUserApplicationDto } from '../dto';
import { jest } from '@jest/globals';

describe('NewUserUseCase', () => {
  let newUserUseCase: NewUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository<IUserModel>>;
  let mockDomainController: jest.Mocked<Domain>;
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
    } as jest.Mocked<Domain>;

    mockPasswordHashService = {
      hash: jest.fn(() => 'hashed_password'),
      compare: jest.fn((password, hash) => password === hash),
    } as jest.Mocked<IPasswordHashDomainService>;

    newUserUseCase = new NewUserUseCase(
      mockUserRepository,
      mockDomainController,
      mockPasswordHashService,
    );
  });

  it('should create a new user and return user DTO', async () => {
    const newUserDto: NewUserApplicationDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: '123456',
    };

    const createdUserDomain: UserApplicationDto = {
      id: '1',
      email: newUserDto.email,
      name: newUserDto.name,
      password: 'hashed_password',
    };

    const savedUser: IUserModel = {
      id: '1',
      email: createdUserDomain.email,
      name: createdUserDomain.name,
      password: createdUserDomain.password,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockDomainController.createUser.mockReturnValue(createdUserDomain);
    mockUserRepository.registerUser.mockResolvedValue(savedUser);

    const result = await newUserUseCase.execute(newUserDto);

    expect(mockDomainController.createUser).toHaveBeenCalledWith(
      expect.any(CreateUserDomainDto),
      mockPasswordHashService,
    );
    expect(mockUserRepository.registerUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
      }),
    );

    expect(result).toEqual({
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
    });
  });

  it('should throw an error if user creation fails', async () => {
    const newUserDto: NewUserApplicationDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: '123456',
    };

    mockDomainController.createUser.mockImplementation(() => {
      throw new Error('User creation failed');
    });

    await expect(newUserUseCase.execute(newUserDto)).rejects.toThrow(
      'User creation failed',
    );

    expect(mockDomainController.createUser).toHaveBeenCalled();
    expect(mockUserRepository.registerUser).not.toHaveBeenCalled();
  });
});
