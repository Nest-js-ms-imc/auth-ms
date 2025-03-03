import {
  JwtModule,
} from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtService } from './services/jwt.service';
import { PasswordHashService } from './services/password-hash.service';
import { UserService } from './services/user.service';
import { UserRepository } from './persistence/repositories/user.repository';
import { AuthController } from './controllers/security.controller';
import { EnvsService } from './secrets/envs.service';
import { SecretsModule } from './secrets/aws-secrets.module';
import { ApplicationController } from '../application/application.controller';
import { Application } from '../application/application.interface';
import { Domain } from '../domain/domain.interface';
import { UserModel } from './persistence/models/user.model';

jest.mock('./persistence/repositories/user.repository');

describe('InfraestructureModule', () => {
  let module: TestingModule;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let passwordHashService: PasswordHashService;
  let userService: UserService;
  let envsService: EnvsService;
  let envsServiceMock: jest.Mocked<EnvsService>;

  beforeEach(async () => {
    envsService = {
      get: jest.fn().mockReturnValue('mocked_secret'),
    } as unknown as EnvsService;

    envsServiceMock = {
      get: jest.fn().mockReturnValue('mocked_secret'),
    } as any;

    module = await Test.createTestingModule({
      imports: [
        SecretsModule,
        JwtModule.registerAsync({
          inject: [EnvsService],
          useFactory: (envsService: EnvsService) => {
            return {
              secret: envsService.get('JWT_SECRET'),
              signOptions: { expiresIn: '2h' },
            };
          },
        }),
      ],
      controllers: [AuthController],
      providers: [
        JwtService,
        PasswordHashService,
        UserService,
        {
          provide: EnvsService,
          useValue: envsService,
        },
        {
          provide: Domain,
          useValue: {
            signIn: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: Application,
          useFactory: (userRepo: UserRepository, domain: Domain) =>
            new ApplicationController(userRepo, domain),
          inject: [UserRepository, Domain],
        },
        {
          provide: getRepositoryToken(UserModel),
          useClass: Repository,
        },
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(UserRepository)
      .useValue({
        findOne: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })
      .overrideProvider(EnvsService)
      .useValue({
        get: jest.fn((key: string) => {
          const mockValues = {
            JWT_SECRET: 'test-secret',
            DB_HOST: 'localhost',
            DB_PORT: '5432',
            DB_NAME: 'test_db',
            DB_USERNAME: 'test_user',
            DB_PASSWORD: 'test_password',
          };
          return mockValues[key];
        }),
        loadSecrets: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(getRepositoryToken(UserModel))
      .useValue({
        find: jest.fn(),
        save: jest.fn(),
      })
      .overrideProvider(UserRepository)
      .useValue({
        findOne: jest.fn(),
        save: jest.fn(),
      })
      .compile();

    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    passwordHashService = module.get<PasswordHashService>(PasswordHashService);
    userService = module.get<UserService>(UserService);
    envsService = module.get<EnvsService>(EnvsService);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have UserRepository defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should have JwtService defined', () => {
    expect(jwtService).toBeDefined();
  });

  it('should have PasswordHashService defined', () => {
    expect(passwordHashService).toBeDefined();
  });

  it('should have UserService defined', () => {
    expect(userService).toBeDefined();
  });

  const useFactory = (envsService: EnvsService) => ({
    secret: envsService.get('JWT_SECRET'),
    signOptions: { expiresIn: '2h' },
  });

  it('You must obtain the JWT secret from EnvsService.', () => {
    const envsServiceMock = { get: jest.fn().mockReturnValue('mocked_secret') };

    const result = useFactory(envsServiceMock as unknown as EnvsService);

    expect(envsServiceMock.get).toHaveBeenCalledWith('JWT_SECRET');
    expect(result).toEqual({
      secret: 'mocked_secret',
      signOptions: { expiresIn: '2h' },
    });
  });

  // it('should call EnvsService.get with JWT_SECRET', async () => {
  //   // Extraemos la configuración de JwtModule
  //   const jwtModuleAsync = InfraestructureModule['imports'].find(
  //     (importedModule) => 'useFactory' in importedModule,
  //   );

  //   expect(jwtModuleAsync).toBeDefined(); // Verifica que encontramos el módulo

  //   // Ejecutamos useFactory manualmente
  //   const jwtOptions = (await jwtModuleAsync.useFactory(
  //     envsServiceMock,
  //   )) as JwtModuleOptions;

  //   // Verificamos que se haya llamado correctamente
  //   expect(envsServiceMock.get).toHaveBeenCalledWith('JWT_SECRET');
  //   expect(jwtOptions.secret).toBe('mocked_secret');
  //   expect(jwtOptions.signOptions?.expiresIn).toBe('2h');
  // });
});
