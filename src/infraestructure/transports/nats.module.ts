import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { NATS_SERVICE } from '../config/services';
import { EnvsService, SecretsModule } from '../secrets';

@Module({
  imports: [
    SecretsModule,
    ClientsModule.registerAsync([
      {
        name: NATS_SERVICE,
        useFactory: async (envsService: EnvsService) => {
          await envsService.loadSecrets();

          // console.log(
          //   'NATS_SERVERS desde NatsModule',
          //   envsService.get('NATS_SERVERS'),
          // );

          return {
            transport: Transport.NATS,
            options: {
              servers: envsService.get('NATS_SERVERS').split('*'),
              // servers: ['nats://localhost:4222', 'nats://localhost:4223'],
            },
          };
        },
        inject: [EnvsService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsModule {}
