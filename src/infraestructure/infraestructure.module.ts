import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PersistenceModule } from './persistence/persistence.module';
import { Application } from '../application/application.interface';
import { UserRepository } from './persistence/repositories/user.repository';
import { ApplicationController } from '../application/application.controller';
import { DomainController } from '../domain/domain.controller';
import { Domain } from '../domain/domain.interface';
import { AuthController } from './controllers/auth.controller';
import { EnvsService, SecretsModule } from './secrets';
import {
  JwtService,
  PasswordHashService,
  RedisService,
  UserService,
} from './services';

@Module({
  imports: [
    SecretsModule,
    PersistenceModule,
    JwtModule.registerAsync({
      imports: [SecretsModule],
      inject: [EnvsService],
      global: true,
      useFactory: async (envsService: EnvsService) => {
        await envsService.loadSecrets();

        // console.log(
        //   '🚀 EnvsService dentro de JwtModule:',
        //   envsService,
        //   envsService.get('JWT_SECRET'),
        // );

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
    RedisService,
    {
      provide: Domain,
      useClass: DomainController,
    },
    {
      provide: Application,
      inject: [UserRepository, Domain],
      useFactory: (userRepository: UserRepository, domainController: Domain) =>
        new ApplicationController(userRepository, domainController),
    },
    {
      provide: UserService,
      inject: [UserRepository],
      useFactory: (userRepository: UserRepository) =>
        new UserService(userRepository),
    },
  ],
  exports: [UserService],
})
export class InfraestructureModule {}
