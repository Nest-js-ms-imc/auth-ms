import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { InfraestructureModule } from './infraestructure/infraestructure.module';
import { EnvsService } from './infraestructure/secrets/envs.service';

async function bootstrap() {
  const logger = new Logger('auth-ms');

  const app = await NestFactory.create(InfraestructureModule);
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.TCP,
  //     options: {
  //       port: envs.port,
  //     },
  //   },
  // );

  const envsService = app.get(EnvsService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(envsService.get('PORT'));
  // await app.listen();

  logger.log(`Auth Microservice running on port ${envsService.get('PORT')}`);
}
void bootstrap();
