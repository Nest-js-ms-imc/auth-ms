import { RpcException } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserRepository } from './user.repository';
import { UserModel } from '../models/user.model';
import { UserApplicationDto } from 'src/application/dto';
import { PasswordHashService } from '../../services/password-hash.service';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let repositoryMock: jest.Mocked<Repository<UserModel>>;
  let passwordHashServiceMock: jest.Mocked<PasswordHashService>;

  beforeEach(async () => {
    repositoryMock = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserModel>>;

    passwordHashServiceMock = {
      compare: jest.fn(),
    } as unknown as jest.Mocked<PasswordHashService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: getRepositoryToken(UserModel), useValue: repositoryMock },
        { provide: PasswordHashService, useValue: passwordHashServiceMock },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a user if it does not exist', async () => {
      const userDto: UserApplicationDto = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'hashedpassword',
      };

      repositoryMock.findOne.mockResolvedValue(null);
      repositoryMock.save.mockResolvedValue(userDto as UserModel);

      const result = await userRepository.registerUser(userDto);
      expect(repositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining(userDto),
      );
      expect(result).toEqual(userDto);
    });

    it('should throw error if user already exists', async () => {
      const userDto: UserApplicationDto = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'hashedpassword',
      };

      repositoryMock.findOne.mockResolvedValue(userDto as UserModel);

      await expect(userRepository.registerUser(userDto)).rejects.toThrow(
        new RpcException({ status: 400, message: 'User already exists' }),
      );
    });
  });

  describe('loginUser', () => {
    it('should allow login if the credentials are correct', async () => {
      const userDto = {
        email: 'johndoe@example.com',
        password: 'password123',
      };

      const userModel = {
        ...userDto,
        password: 'hashedpassword',
      } as UserModel;

      repositoryMock.findOne.mockResolvedValue(userModel);
      passwordHashServiceMock.compare.mockReturnValue(true);

      const result = await userRepository.loginUser(userDto);

      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { email: userDto.email, isActive: true },
      });
      expect(passwordHashServiceMock.compare).toHaveBeenCalledWith(
        userDto.password,
        userModel.password,
      );
      expect(result).toHaveProperty('token');
    });

    it('should throw error if the user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      await expect(
        userRepository.loginUser({
          email: 'johndoe@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(
        new RpcException({ status: 400, message: 'User/Password not valid' }),
      );
    });

    it('should throw an error if the password is incorrect', async () => {
      const userModel = {
        email: 'johndoe@example.com',
        password: 'hashedpassword',
      } as UserModel;

      repositoryMock.findOne.mockResolvedValue(userModel);
      passwordHashServiceMock.compare.mockReturnValue(false);

      await expect(
        userRepository.loginUser({
          email: 'johndoe@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(
        new RpcException({ status: 400, message: 'User/Password not valid' }),
      );
    });
  });

  describe('deleteUser', () => {
    it('should deactivate an existing user', async () => {
      const userModel = {
        email: 'johndoe@example.com',
        isActive: true,
      } as UserModel;

      repositoryMock.findOne.mockResolvedValue(userModel);
      repositoryMock.save.mockResolvedValue({ ...userModel, isActive: false });

      const result = await userRepository.deleteUser('johndoe@example.com');

      expect(repositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
      expect(result.isActive).toBe(false);
    });

    it('should throw error if the user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      await expect(
        userRepository.deleteUser('notfound@example.com'),
      ).rejects.toThrow(
        new RpcException({ status: 400, message: 'User not found' }),
      );
    });
  });
});
