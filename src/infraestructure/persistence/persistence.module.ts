import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModel } from './models/user.model';
import { UserRepository } from './repositories/user.repository';
import { PasswordHashService } from '../services/password-hash.service';
import { EnvsService } from '../secrets/envs.service';
import { SecretsModule } from '../secrets/aws-secrets.module';

@Module({
  imports: [
    SecretsModule,
    TypeOrmModule.forRootAsync({
      imports: [SecretsModule],
      inject: [EnvsService],
      useFactory: async (envsService: EnvsService) => {
        await envsService.loadSecrets();

        // console.log('🟢 EnvsService en PersistenceModule:', envsService);
        // console.log('🟢 DB_HOST:', envsService.get('DB_HOST'));
        // console.log('🟢 DB_PORT:', envsService.get('DB_PORT'));
        // console.log('🟢 DB_USERNAME:', envsService.get('DB_USERNAME'));
        // console.log('🟢 DB_PASSWORD:', envsService.get('DB_PASSWORD'));
        // console.log('🟢 DB_NAME:', envsService.get('DB_NAME'));

        return {
          type: 'postgres',
          host: envsService.get('DB_HOST'),
          port: +envsService.get('DB_PORT'),
          database: envsService.get('DB_NAME'),
          username: envsService.get('DB_USERNAME'),
          password: envsService.get('DB_PASSWORD'),
          // host: 'localhost',
          // port: 5432,
          // database: 'AuthDB',
          // username: 'postgres',
          // password: 'M1S3Cr37P4s5w0rd',
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    TypeOrmModule.forFeature([UserModel]),
  ],
  controllers: [],
  providers: [UserRepository, PasswordHashService],
  exports: [UserRepository],
})
export class PersistenceModule {}
