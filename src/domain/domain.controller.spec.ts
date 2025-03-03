import { DomainController } from './domain.controller';
import { CreateUserDomainDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { IPasswordHashDomainService } from './services/password-hash.service';
import { IUserDomainService } from './services/user.service';
import { InvalidDataException } from './exceptions/invalid-data.exception';

const mockPasswordHashService: IPasswordHashDomainService = {
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
};

const mockUserService: IUserDomainService = {
  validateUserAndPassword: jest.fn().mockResolvedValue(null),
};

jest.mock('./entities/user.entity');

describe('DomainController', () => {
  let controller: DomainController;

  beforeEach(() => {
    controller = new DomainController();
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('Should create user', () => {
      const mockData: CreateUserDomainDto = {
        name: 'Juan Test',
        email: 'test@example.com',
        password: '123456',
      };

      const mockUser = {
        validate: jest.fn(),
        isValid: jest.fn().mockReturnValue(true),
        create: jest.fn().mockReturnValue({ email: mockData.email }),
      };

      (UserEntity as jest.Mock).mockImplementation(() => mockUser);

      const result = controller.createUser(mockData, mockPasswordHashService);

      expect(result).toEqual({ email: mockData.email });
      expect(mockUser.validate).toHaveBeenCalled();
      expect(mockUser.isValid).toHaveBeenCalled();
      expect(mockUser.create).toHaveBeenCalledWith(mockData);
    });

    it('Should launch InvalidDataException', () => {
      const mockData: CreateUserDomainDto = {
        name: 'Juan test',
        email: 'test@example',
        password: '123',
      };

      const mockUser = {
        validate: jest.fn(),
        isValid: jest.fn().mockReturnValue(false),
        getErrors: jest
          .fn()
          .mockReturnValue(['Invalid email', 'Invalid password']),
      };

      (UserEntity as jest.Mock).mockImplementation(() => mockUser);

      expect(() => {
        controller.createUser(mockData, mockPasswordHashService);
      }).toThrow(InvalidDataException);
    });
  });

  describe('signIn', () => {
    it('Should signIn', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = '123456';

      const mockUser = {
        validate: jest.fn(),
        isValid: jest.fn().mockReturnValue(true),
        signIn: jest.fn().mockResolvedValue({
          user: { id: 1, email: mockEmail },
          token: 'mock_token',
        }),
      };

      (UserEntity as jest.Mock).mockImplementation(() => mockUser);

      const result = await controller.signIn(
        mockEmail,
        mockPassword,
        mockUserService,
        mockPasswordHashService,
      );

      expect(result).toEqual({
        user: { id: 1, email: mockEmail },
        token: 'mock_token',
      });
      expect(mockUser.validate).toHaveBeenCalled();
      expect(mockUser.isValid).toHaveBeenCalled();
      expect(mockUser.signIn).toHaveBeenCalledWith(mockUserService);
    });

    it('Should launch InvalidDataException', async () => {
      const mockEmail = '';
      const mockPassword = '';

      const mockUser = {
        validate: jest.fn(),
        isValid: jest.fn().mockReturnValue(false),
        getErrors: jest
          .fn()
          .mockReturnValue(['Invalid email', 'Invalid password']),
      };

      (UserEntity as jest.Mock).mockImplementation(() => mockUser);

      await expect(async () => {
        await controller.signIn(
          mockEmail,
          mockPassword,
          mockUserService,
          mockPasswordHashService,
        );
      }).rejects.toThrow(InvalidDataException);
    });
  });
});
