import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserModel } from './user.model';

describe('UserModel Repository', () => {
  let userRepository: Repository<UserModel>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'hashed_password',
    isActive: true,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
  };

  const mockRepository = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(UserModel),
          useValue: mockRepository,
        },
      ],
    }).compile();

    userRepository = module.get<Repository<UserModel>>(
      getRepositoryToken(UserModel),
    );
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should get a user by email', async () => {
    const user = await userRepository.findOne({
      where: { email: mockUser.email },
    });
    expect(user).toEqual(mockUser);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
  });

  it('should save a user', async () => {
    const savedUser = await userRepository.save(mockUser);
    expect(savedUser).toEqual(mockUser);
    expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should delete a user', async () => {
    const result = await userRepository.delete(mockUser.id);
    expect(result).toEqual({ affected: 1 });
    expect(mockRepository.delete).toHaveBeenCalledWith(mockUser.id);
  });

  it('should save a user and automatically assign createdAt', async () => {
    const newUser = {
      id: '456e7890-e12b-34d5-a678-426614174111',
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: 'secure_password',
      isActive: true,
    };

    const savedUser = await userRepository.save(newUser);

    expect(savedUser).toHaveProperty('createdAt');
    expect(savedUser.createdAt).toBeInstanceOf(Date);
  });
});
