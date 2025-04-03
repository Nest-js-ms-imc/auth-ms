import { Injectable } from '@nestjs/common';
import { JwtService as JwTokenService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

import { UserApplicationDto } from '../../application/dto';
import { IJwtApplicationService } from '../../application/service/jwt.service';
import { EnvsService } from '../secrets/envs.service';
import { RedisService } from './redis.service';

@Injectable()
export class JwtService implements IJwtApplicationService {
  constructor(
    private readonly jwTokenService: JwTokenService,
    private readonly envsService: EnvsService,
    private readonly redisService: RedisService,
  ) {}

  generateToken(payload: Omit<UserApplicationDto, 'password'>): string {
    return this.jwTokenService.sign(payload);
  }

  async verifyToken(token: string): Promise<{
    user: Omit<UserApplicationDto, 'password'>;
    token: string;
  }> {
    try {
      const isAuthenticated = await this.redisService.get(
        `authenticated:${token}`,
      );

      if (!isAuthenticated) {
        throw new RpcException({
          status: 401,
          message: 'Invalid token',
        });
      }

      const data: UserApplicationDto = this.jwTokenService.verify(token, {
        secret: this.envsService.get('JWT_SECRET'),
      });

      const dataUser = { email: data.email, name: data.name, id: data.id };

      return {
        user: dataUser,
        token: this.generateToken(dataUser),
      };
    } catch {
      throw new RpcException({
        status: 401,
        message: 'Invalid token',
      });
    }
  }
}
