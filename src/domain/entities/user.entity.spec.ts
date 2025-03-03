import { jest } from '@jest/globals';

import { UserEntity } from './user.entity';
import { IPasswordHashDomainService } from '../services/password-hash.service';
import { IUserDomainService } from '../services/user.service';

describe('UserEntity', () => {
  let mockPasswordHashService: jest.Mocked<IPasswordHashDomainService>;
  let mockUserService: jest.Mocked<IUserDomainService>;

  beforeEach(() => {
    mockPasswordHashService = {
      hash: jest.fn((password) => `hashed_${password}`),
      compare: jest.fn(),
    } as jest.Mocked<IPasswordHashDomainService>;

    mockUserService = {
      validateUserAndPassword: jest.fn(),
    } as jest.Mocked<IUserDomainService>;
  });

  it('should create a new user entity with hashed password', () => {
    const user = new UserEntity(mockPasswordHashService);
    user.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    });

    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(mockPasswordHashService.hash).toHaveBeenCalledWith('Password123');
    expect(user.password).toBe('hashed_Password123');
  });

  it('should validate user sign in', async () => {
    const user = new UserEntity(mockPasswordHashService, {
      email: 'john@example.com',
      password: 'hashed_Password123',
    });

    const mockResponse = {
      user: {
        id: '123',
        name: 'John Doe',
        email: 'johndoe@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      token: 'mocked_jwt_token',
    };
    mockUserService.validateUserAndPassword.mockResolvedValue(mockResponse);

    const result = await user.signIn(mockUserService);

    expect(mockUserService.validateUserAndPassword).toHaveBeenCalledWith(
      'john@example.com',
      'hashed_Password123',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should validate user fields correctly', () => {
    const user = new UserEntity(mockPasswordHashService, {
      id: '123',
      name: '',
      email: 'invalid-email',
      password: '123',
    });

    user.validate();

    expect(user.isValid()).toBe(false);
    expect(user.getErrors().has('email')).toBe(true);
    expect(user.getErrors().has('password')).toBe(true);
    expect(user.getErrors().has('name')).toBe(true);
  });

  it('should pass validation for correct user details', () => {
    const user = new UserEntity(mockPasswordHashService, {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    });

    user.validate();

    expect(user.isValid()).toBe(true);
  });
});
