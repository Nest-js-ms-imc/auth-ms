import { Global, Module } from '@nestjs/common';

import { AwsSecretsService } from './aws-secrets.service';
import { EnvsService } from './envs.service';

@Global()
@Module({
  providers: [AwsSecretsService, EnvsService],
  exports: [AwsSecretsService, EnvsService],
})
export class SecretsModule {
  constructor(private readonly envsService: EnvsService) {
    // console.log(
    //   '✅ EnvsService ha sido inyectado en SecretsModule:',
    //   envsService,
    // );
  }
}
