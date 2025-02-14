import { Domain } from 'domain';

import { CreateUserDomainDto } from './dto/create-user.dto';
import { UserDomainDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { IPasswordHashDomainService } from './services/password-hash.service';
import { IUserDomainService } from './services/user.service';
import { InvalidDataException } from './exceptions/invalid-data.exception';
import { UserModel } from 'src/infraestructure/persistence/models/user.model';

export class DomainController extends Domain {
  createUser(
    data: CreateUserDomainDto,
    // uuidService: IUuidDomainService,
    passwordHashService: IPasswordHashDomainService,
  ): UserDomainDto {
    const user = new UserEntity(passwordHashService, data);
    user.validate();
    if (user.isValid() === false) {
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
    if (user.isValid() === false) {
      throw new InvalidDataException('Invalid user data', user.getErrors());
    }
    return user.signIn(userService);
  }
}
