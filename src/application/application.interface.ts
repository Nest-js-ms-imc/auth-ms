import { PasswordHashService } from 'src/infraestructure/services/password-hash.service';
import { UserApplicationDto } from './dto';
import { IJwtApplicationService } from './service/jwt.service';
import { IUserDomainService } from 'src/domain/services/user.service';

export abstract class Application {
  abstract newUser(
    name: string,
    email: string,
    password: string,
    passwordHashService: PasswordHashService,
  ): Promise<UserApplicationDto>;

  abstract login(
    email: string,
    password: string,
    jwtService: IJwtApplicationService,
    userService: IUserDomainService,
    passwordHashService: PasswordHashService,
  );

  abstract verifyToken(
    token: string,
    jwtService: IJwtApplicationService,
  ): Promise<Omit<UserApplicationDto, 'password'>>;

  abstract logOut(token: string): Promise<boolean>;
}
