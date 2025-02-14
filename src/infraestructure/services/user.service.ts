import { Injectable } from '@nestjs/common';

import { IUserDomainService } from 'src/domain/services/user.service';
import { UserRepository } from '../persistence/repositories/user.repository';
import { UserModel } from '../persistence/models/user.model';

@Injectable()
export class UserService implements IUserDomainService {
  constructor(private readonly userRepository: UserRepository) {}

  async validateUserAndPassword(
    email: string,
    password: string,
  ): Promise<{ user: Omit<UserModel, 'password'>; token: string }> {
    return await this.userRepository.loginUser({ email, password });
  }
}
