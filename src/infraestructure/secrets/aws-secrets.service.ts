import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

import { SecretsService } from '../../domain/secrets/secrets.service';

@Injectable()
export class AwsSecretsService implements SecretsService, OnModuleInit {
  private readonly logger = new Logger(AwsSecretsService.name);
  private client: SecretsManagerClient;

  constructor() {
    this.client = new SecretsManagerClient({
      region: 'us-east-1',
      endpoint: 'http://localhost:4566',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
  }

  async getSecret(secretName: string): Promise<string> {
    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.client.send(command);

      if (response.SecretString) {
        // console.log('🟢 Respuesta completa de Secrets Manager:', response);

        return response.SecretString;
      }

      this.logger.warn(`Secret "${secretName}" has no string value`);
      return response.SecretString!;
    } catch (error) {
      this.logger.error(`Failed to retrieve secret "${secretName}":`, error);
      return 'ERROR';
    }
  }

  async onModuleInit() {
    // await this.getSecret('auth-secrets');
    const secrets = await this.getSecret('auth-secrets');
    console.log('secrets loaded: ', secrets);
  }
}
