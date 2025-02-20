import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import * as joi from 'joi';

import { AwsSecretsService } from './aws-secrets.service';

@Injectable()
export class EnvsService implements OnModuleInit {
  private readonly logger = new Logger(EnvsService.name);
  private envConfig: Record<string, string> = {};

  constructor(private readonly secretsService: AwsSecretsService) {}

  async onModuleInit() {
    // console.log(
    //   '✅ EnvsService inicializado. secretsService:',
    //   this.secretsService,
    // );
    // if (!this.secretsService) {
    //   throw new Error('❌ AwsSecretsService no fue inyectado correctamente.');
    // }

    await this.loadSecrets();
  }

  async loadSecrets(): Promise<void> {
    const secretString = await this.secretsService.getSecret('auth-secrets');

    // console.log('🔹 Secretos cargados en EnvsService:', secretString);

    if (!secretString) {
      throw new Error('No se pudieron obtener los secretos de AWS');
    }

    const secretsString = secretString.replace(/^'{|}'$/g, '');

    const secretJson = secretsString.replace(
      /(\w+):([^,{}]+)/g,
      (match, key, value) => {
        if (!isNaN(Number(value))) {
          return `"${key}":${value}`;
        }
        return `"${key}":"${value}"`;
      },
    );

    const parsedSecrets = JSON.parse(`{${secretJson}}`);

    const envsSchema = joi
      .object({
        PORT: joi.number().required(),
        JWT_SECRET: joi.string().required(),
        DB_HOST: joi.string().required(),
        DB_NAME: joi.string().required(),
        DB_USERNAME: joi.string().required(),
        DB_PASSWORD: joi.string().required(),
        DB_PORT: joi.number().required(),
      })
      .unknown(true);

    const { error, value } = envsSchema.validate(parsedSecrets, {
      abortEarly: false,
    });

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    this.envConfig = value;

    // console.log('EnvsService values: ', { value });
  }

  get(key: string): string {
    // console.log(`🔹 Buscando variable ${key}:`, key, this.envConfig);

    return this.envConfig[key];
  }
}
