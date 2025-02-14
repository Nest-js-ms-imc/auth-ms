import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PersistenceModule } from './persistence/persistence.module';
import { JwtService } from './services/jwt.service';
import { PasswordHashService } from './services/password-hash.service';
import { UserService } from './services/user.service';
import { Presentation } from 'src/presentation/presentation.interface';
import { UserRepository } from './persistence/repositories/user.repository';
import { PresentationController } from 'src/presentation/presentation.controller';
import { DomainController } from 'src/domain/domain.controller';
import { Domain } from 'src/domain/domain.interface';
import { AuthController } from './controllers/security.controller';
import { envs } from 'src/config';

@Module({
  imports: [
    PersistenceModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: { expiresIn: '2h' },
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
      provide: Presentation,
      inject: [UserRepository, Domain],
      useFactory: (userRepository: UserRepository, domainController: Domain) =>
        new PresentationController(userRepository, domainController),
    },
  ],
})
export class InfraestructureModule {}
