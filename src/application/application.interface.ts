import { UserApplicationDto } from './dto';
import { IJwtApplicationService } from './service/jwt.service';
import { IUserDomainService } from 'src/domain/services/user.service';
import { IPasswordHashDomainService } from '@/domain/services';
import { IRedisDomainService } from '@/domain/services/redis.service';

export abstract class Application {
  abstract newUser(
    name: string,
    email: string,
    password: string,
    passwordHashService: IPasswordHashDomainService,
  ): Promise<UserApplicationDto>;

  abstract login(
    email: string,
    password: string,
    jwtService: IJwtApplicationService,
    userService: IUserDomainService,
    passwordHashService: IPasswordHashDomainService,
    redisService: IRedisDomainService,
  ): Promise<string>;

  abstract verifyToken(
    token: string,
    jwtService: IJwtApplicationService,
  ): Promise<Omit<UserApplicationDto, 'password'>>;

  abstract logOut(token: string): Promise<string>;
}
