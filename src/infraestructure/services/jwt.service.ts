import { Injectable } from '@nestjs/common';
import { JwtService as JwTokenService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

import { envs } from 'src/config';
import { UserPresentationDto } from 'src/presentation/dto';
import { IJwtPresentationService } from 'src/presentation/service/jwt.service';

@Injectable()
export class JwtService implements IJwtPresentationService {
  constructor(private readonly jwTokenService: JwTokenService) {}

  generateToken(payload: Omit<UserPresentationDto, 'password'>): string {
    return this.jwTokenService.sign(payload);
  }

  verifyToken(token: string): {
    user: Omit<UserPresentationDto, 'password'>;
    token: string;
  } {
    try {
      const data: UserPresentationDto = this.jwTokenService.verify(token, {
        secret: envs.jwtSecret,
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
