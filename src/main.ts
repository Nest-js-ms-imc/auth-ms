import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { envs } from './config';
import { InfraestructureModule } from './infraestructure/infraestructure.module';

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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  // await app.listen();

  logger.log(`Auth Microservice running on port ${envs.port}`);
}
void bootstrap();
