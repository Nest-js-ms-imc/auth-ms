import { CreateUserDomainDto } from './dto/create-user.dto';
import { PasswordHashService } from '../infraestructure/services/password-hash.service';
import { UserDomainDto } from './dto/user.dto';
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
}
