import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import * as joi from 'joi';

import { AwsSecretsService } from './aws-secrets.service';

@Injectable()
export class EnvsService implements OnModuleInit {
  private readonly logger = new Logger(EnvsService.name);
  private envConfig: Record<string, string> = {};

  constructor(private readonly secretsService: AwsSecretsService) {}

  async onModuleInit() {
    // this.logger.log(
    //   '✅ EnvsService inicializado. secretsService:',
    //   this.secretsService,
    // );
    // if (!this.secretsService) {
    //   throw new Error('❌ AwsSecretsService no fue inyectado correctamente.');
    // }

    await this.loadSecrets();
  }

  async loadSecrets(): Promise<void> {
    const rawString = await this.secretsService.getSecret('auth-secrets');

    // this.logger.log('🔹 Secretos cargados en EnvsService:', rawString);

    if (!rawString) {
      throw new Error('Secrets are empty or undefined');
    }

    // const cleanedString = rawString.replace(/^'{|}'$/g, '');
    const cleanedString = rawString.replace(/;/g, ':');

    // this.logger.log(`🔹 EnvsService cleanedString:`, cleanedString);

    // const fixedJson = Object.fromEntries(
    //   cleanedString.split(',').map((pair) => {
    //     const [key, value] = pair.split(';');
    //     return [key, value];
    //   }),
    // );

    // this.logger.log(`🔹 EnvsService fixedJson:`, { fixedJson });

    // const parsedObject = JSON.parse(fixedJson);
    const parsedObject = JSON.parse(cleanedString);
    // const parsedObject = fixedJson;

    // this.logger.log(`🔹 EnvsService parsedObject:`, { parsedObject });

    const envsSchema = joi
      .object({
        PORT: joi.number().required(),
        JWT_SECRET: joi.string().required(),
        DB_HOST: joi.string().required(),
        DB_NAME: joi.string().required(),
        DB_USERNAME: joi.string().required(),
        DB_PASSWORD: joi.string().required(),
        DB_PORT: joi.number().required(),
        NATS_SERVERS: joi.string().required(),
      })
      .unknown(true);

    const { error, value } = envsSchema.validate(parsedObject, {
      abortEarly: false,
    });

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    this.envConfig = value;

    // this.logger.log('EnvsService values: ', { value });
  }

  get(key: string): string {
    // this.logger.log(`🔹 Buscando variable ${key}:`, key, this.envConfig);

    return this.envConfig[key];
  }
}
