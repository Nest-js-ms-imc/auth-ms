import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UserModel } from './models/user.model';
import { UserRepository } from './repositories/user.repository';
import { PasswordHashService, RedisService } from '../services';
import { EnvsService, SecretsModule } from '../secrets';

describe('PersistenceModule', () => {
  let module: TestingModule;
  let userRepository: UserRepository;
  let envsServiceMock: Partial<EnvsService>;
  let userRepositoryMock: Partial<
    Record<keyof Repository<UserModel>, jest.Mock>
  >;
  let dataSourceMock: Partial<DataSource>;

  beforeEach(async () => {
    envsServiceMock = {
      get: jest.fn((key) => {
        const mockEnv = {
          DB_HOST: 'localhost',
          DB_PORT: '5432',
          DB_USERNAME: 'test_user',
          DB_PASSWORD: 'test_password',
          DB_NAME: 'test_db',
        };
        return mockEnv[key];
      }),
      loadSecrets: jest.fn().mockResolvedValue(undefined),
    };

    userRepositoryMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(userRepositoryMock),
      createQueryRunner: jest
        .fn()
        .mockReturnValue({ connect: jest.fn(), release: jest.fn() }),
    };

    module = await Test.createTestingModule({
      imports: [SecretsModule],
      providers: [
        UserRepository,
        PasswordHashService,
        RedisService,
        { provide: EnvsService, useValue: envsServiceMock },
        {
          provide: getRepositoryToken(UserModel),
          useValue: userRepositoryMock,
        },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('module should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should get an instance of the UserRepository', () => {
    expect(userRepository).toBeDefined();
  });
});
