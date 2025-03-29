import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PersistenceModule } from './persistence/persistence.module';
import { JwtService } from './services/jwt.service';
import { PasswordHashService } from './services/password-hash.service';
import { UserService } from './services/user.service';
import { Application } from '../application/application.interface';
import { UserRepository } from './persistence/repositories/user.repository';
import { ApplicationController } from '../application/application.controller';
import { DomainController } from '../domain/domain.controller';
import { Domain } from '../domain/domain.interface';
import { AuthController } from './controllers/auth.controller';
import { SecretsModule } from './secrets/aws-secrets.module';
import { EnvsService } from './secrets/envs.service';

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
  ],
})
export class InfraestructureModule {}
