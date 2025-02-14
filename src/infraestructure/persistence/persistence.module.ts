import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { envs } from 'src/config';
import { UserModel } from './models/user.model';
import { UserRepository } from './repositories/user.repository';
import { PasswordHashService } from '../services/password-hash.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      database: envs.dbName,
      username: envs.dbUsername,
      password: envs.dbPassword,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserModel]),
  ],
  controllers: [],
  providers: [UserRepository, PasswordHashService],
  exports: [UserRepository],
})
export class PersistenceModule {}
