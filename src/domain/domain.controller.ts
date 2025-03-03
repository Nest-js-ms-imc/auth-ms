import { Domain } from 'domain';

import { UserEntity } from './entities/user.entity';
import { IPasswordHashDomainService } from './services/password-hash.service';
import { IUserDomainService } from './services/user.service';
import { InvalidDataException } from './exceptions/invalid-data.exception';
import { UserModel } from 'src/infraestructure/persistence/models/user.model';
import { CreateUserDomainDto, UserDomainDto } from './dto';

export class DomainController extends Domain {
  createUser(
    data: CreateUserDomainDto,
    passwordHashService: IPasswordHashDomainService,
  ): UserDomainDto {
    const user = new UserEntity(passwordHashService, data);
    user.validate();

    if (!user.isValid()) {
      throw new InvalidDataException('Invalid user data', user.getErrors());
    }
    return user.create(data);
  }

  signIn(
    email: string,
    password: string,
    userService: IUserDomainService,
    passwordHashService: IPasswordHashDomainService,
  ): Promise<{ user: Omit<UserModel, 'password'>; token: string }> {
    const user = new UserEntity(passwordHashService, { email, password });
    user.validate();

    if (!user.isValid()) {
      throw new InvalidDataException('Invalid user data', user.getErrors());
    }
    return user.signIn(userService);
  }
}
