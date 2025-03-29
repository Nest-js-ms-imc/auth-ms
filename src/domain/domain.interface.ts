import { JwtService } from '../infraestructure/services/jwt.service';
import { PasswordHashService } from '../infraestructure/services/password-hash.service';
import { CreateUserDomainDto, UserDomainDto } from './dto';
import { IUserDomainService } from './services/user.service';

export abstract class Domain {
  abstract createUser(
    data: CreateUserDomainDto,
    passwordHashService: PasswordHashService,
  ): UserDomainDto;

  abstract signIn(
    email: string,
    password: string,
    userService: IUserDomainService,
    passwordHashService: PasswordHashService,
  ): Promise<boolean>;

  abstract verifyToken(token: string): Promise<Omit<UserDomainDto, 'password'>>;
}
