import { LogOutApplicationDto } from '../dto';
import { IUserModel } from '../persistence/models/user.model';
import { IUserRepository } from '../persistence/repositories/user.repository';

export class LogOutUseCase {
  constructor(private readonly userRepository: IUserRepository<IUserModel>) {}

  async execute(logOutApplicationDto: LogOutApplicationDto): Promise<string> {
    return await this.userRepository.logout(logOutApplicationDto.token);
  }
}
