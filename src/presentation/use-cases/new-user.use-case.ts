import { Domain } from 'src/domain/domain.interface';
import { CreateUserDomainDto } from 'src/domain/dto/create-user.dto';
import { IPasswordHashDomainService } from 'src/domain/services/password-hash.service';
import { UserPresentationDto } from '../dto/user.dto';
import { IUserModel } from '../persistence/models/user.model';
import { IUserRepository } from '../persistence/repositories/user.repository';
import { NewUserPresentationDto } from '../dto';

export class NewUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository<IUserModel>,
    private readonly domainController: Domain,
    // private readonly uuidService: IUuidDomainService,
    private readonly passwordHashService: IPasswordHashDomainService,
  ) {}

  async execute(
    newUserDto: NewUserPresentationDto,
  ): Promise<UserPresentationDto> {
    const newUser = this.mapUserDtoToDomain(newUserDto);

    const data = this.domainController.createUser(
      newUser,
      // this.uuidService,
      this.passwordHashService,
    );

    const user = this.mapUserDtoToPersistence(data);

    const userDto = await this.userRepository.registerUser(user);

    const answer = this.mapUserDtoToPresentation(userDto);
    return answer;
  }

  private mapUserDtoToDomain(
    userDto: NewUserPresentationDto,
  ): CreateUserDomainDto {
    const user = new CreateUserDomainDto();
    user.email = userDto.email;
    user.name = userDto.name;
    user.password = userDto.password;
    return user;
  }

  private mapUserDtoToPersistence(
    userDto: UserPresentationDto,
  ): UserPresentationDto {
    const user = new UserPresentationDto();
    user.id = userDto.id;
    user.email = userDto.email;
    user.name = userDto.name;
    user.password = userDto.password;
    return user;
  }

  private mapUserDtoToPresentation(userDto: IUserModel): UserPresentationDto {
    const user = new UserPresentationDto();
    user.id = userDto.id;
    user.email = userDto.email;
    user.name = userDto.name;
    return user;
  }
}
