import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../persistence/repositories/user.repository';
import { UserModel } from '../persistence/models/user.model';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            loginUser: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('should validate a user and return its token', async () => {
    const mockUser: Omit<UserModel, 'password'> = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-01'),
      deletedAt: null,
    };
    const mockToken = 'mocked-token';

    jest
      .spyOn(userRepository, 'loginUser')
      .mockResolvedValue({ user: mockUser, token: mockToken });

    const result = await userService.validateUserAndPassword(
      'test@example.com',
      'password123',
    );

    expect(userRepository.loginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({ user: mockUser, token: mockToken });
  });

  it('should throw an error if login fails', async () => {
    jest
      .spyOn(userRepository, 'loginUser')
      .mockRejectedValue(new Error('Credenciales inválidas'));

    await expect(
      userService.validateUserAndPassword('test@example.com', 'wrong-password'),
    ).rejects.toThrow('Credenciales inválidas');
  });
});
