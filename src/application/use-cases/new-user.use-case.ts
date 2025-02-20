import { Domain } from 'src/domain/domain.interface';
import { CreateUserDomainDto } from '../../domain/dto/create-user.dto';
import { IPasswordHashDomainService } from 'src/domain/services/password-hash.service';
import { UserApplicationDto } from '../dto/user.dto';
import { IUserModel } from '../persistence/models/user.model';
import { IUserRepository } from '../persistence/repositories/user.repository';
import { NewUserApplicationDto } from '../dto';

export class NewUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository<IUserModel>,
    private readonly domainController: Domain,
    // private readonly uuidService: IUuidDomainService,
    private readonly passwordHashService: IPasswordHashDomainService,
  ) {}

  async execute(
    newUserDto: NewUserApplicationDto,
  ): Promise<UserApplicationDto> {
    const newUser = this.mapUserDtoToDomain(newUserDto);

    const data = this.domainController.createUser(
      newUser,
      // this.uuidService,
      this.passwordHashService,
    );

    const user = this.mapUserDtoToPersistence(data);

    const userDto = await this.userRepository.registerUser(user);

    const answer = this.mapUserDtoToApplication(userDto);
    return answer;
  }

  private mapUserDtoToDomain(
    userDto: NewUserApplicationDto,
  ): CreateUserDomainDto {
    const user = new CreateUserDomainDto();
    user.email = userDto.email;
    user.name = userDto.name;
    user.password = userDto.password;
    return user;
  }

  private mapUserDtoToPersistence(
    userDto: UserApplicationDto,
  ): UserApplicationDto {
    const user = new UserApplicationDto();
    user.id = userDto.id;
    user.email = userDto.email;
    user.name = userDto.name;
    user.password = userDto.password;
    return user;
  }

  private mapUserDtoToApplication(userDto: IUserModel): UserApplicationDto {
    const user = new UserApplicationDto();
    user.id = userDto.id;
    user.email = userDto.email;
    user.name = userDto.name;
    return user;
  }
}
