import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { InfraestructureModule } from './infraestructure/infraestructure.module';
import { EnvsService } from './infraestructure/secrets/envs.service';

async function bootstrap() {
  const logger = new Logger('auth-ms');

  // const app = await NestFactory.create(InfraestructureModule);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InfraestructureModule,
    {
      transport: Transport.NATS,
      options: {
        servers: (await NestFactory.create(InfraestructureModule))
          .get(EnvsService)
          .get('NATS_SERVERS')
          .split('**'),
        // servers: ['nats://localhost:4222', 'nats://localhost:4223'],
      },
    },
  );

  const envsService = app.get(EnvsService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // await app.listen(envsService.get('PORT'));
  await app.listen();

  logger.log(`Auth Microservice running on port ${envsService.get('PORT')}`);
}
void bootstrap();
