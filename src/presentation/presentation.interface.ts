import { PasswordHashService } from 'src/infraestructure/services/password-hash.service';
import { UserPresentationDto } from './dto';
import { IJwtPresentationService } from './service/jwt.service';
import { IUserDomainService } from 'src/domain/services/user.service';

export abstract class Presentation {
  abstract newUser(
    name: string,
    email: string,
    password: string,
    passwordHashService: PasswordHashService,
  ): Promise<UserPresentationDto>;

  abstract login(
    email: string,
    password: string,
    jwtService: IJwtPresentationService,
    userService: IUserDomainService,
    passwordHashService: PasswordHashService,
  );
}
