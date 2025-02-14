import { Domain } from 'src/domain/domain.interface';
import { IPasswordHashDomainService } from 'src/domain/services/password-hash.service';
import { IUserDomainService } from 'src/domain/services/user.service';
import { UseCaseException } from '../exceptions/use-case.exception';
import { IUserModel } from '../persistence/models/user.model';
import { IUserRepository } from '../persistence/repositories/user.repository';
import {
  SignInPresentationDto,
  TokenPresentationDto,
  UserPresentationDto,
} from '../dto';
import { IJwtPresentationService } from '../service/jwt.service';

export class SignInUseCase {
  constructor(
    private readonly userRepository: IUserRepository<IUserModel>,
    private readonly domainController: Domain,
    private readonly jwtService: IJwtPresentationService,
    private readonly userService: IUserDomainService,
    private readonly passwordHashService: IPasswordHashDomainService,
  ) {}

  async execute(
    signInDto: SignInPresentationDto,
  ): Promise<TokenPresentationDto> {
    const isAuthenticated = await this.domainController.signIn(
      signInDto.email,
      signInDto.password,
      this.userService,
      this.passwordHashService,
    );

    if (isAuthenticated) {
      const token = new TokenPresentationDto();
      const data = await this.userRepository.findByEmail(signInDto.email);
      if (!data) {
        throw new UseCaseException('Invalid email or password');
      }
      const { email, id, name } = this.mapUserModelToUserDto(data);
      token.token = this.generateToken({ email, id, name });
      return token;
    }

    throw new UseCaseException('Invalid email or password');
  }

  private generateToken(data: Omit<UserPresentationDto, 'password'>): string {
    return this.jwtService.generateToken(data);
  }

  private mapUserModelToUserDto(user: IUserModel): UserPresentationDto {
    const userDto = new UserPresentationDto();
    userDto.id = user.id;
    userDto.name = user.name;
    userDto.email = user.email;
    return userDto;
  }
}
