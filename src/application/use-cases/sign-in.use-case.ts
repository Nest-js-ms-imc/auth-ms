import { Domain } from 'src/domain/domain.interface';
import { IPasswordHashDomainService } from '../..//domain/services/password-hash.service';
import { IUserDomainService } from 'src/domain/services/user.service';
import { UseCaseException } from '../exceptions/use-case.exception';
import { IUserModel } from '../persistence/models/user.model';
import { IUserRepository } from '../persistence/repositories/user.repository';
import {
  SignInApplicationDto,
  TokenApplicationDto,
  UserApplicationDto,
} from '../dto';
import { IJwtApplicationService } from '../service/jwt.service';

export class SignInUseCase {
  constructor(
    private readonly userRepository: IUserRepository<IUserModel>,
    private readonly domainController: Domain,
    private readonly jwtService: IJwtApplicationService,
    private readonly userService: IUserDomainService,
    private readonly passwordHashService: IPasswordHashDomainService,
  ) {}

  async execute(signInDto: SignInApplicationDto): Promise<TokenApplicationDto> {
    const isAuthenticated = await this.domainController.signIn(
      signInDto.email,
      signInDto.password,
      this.userService,
      this.passwordHashService,
    );

    if (isAuthenticated) {
      const token = new TokenApplicationDto();
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

  private generateToken(data: Omit<UserApplicationDto, 'password'>): string {
    return this.jwtService.generateToken(data);
  }

  private mapUserModelToUserDto(user: IUserModel): UserApplicationDto {
    const userDto = new UserApplicationDto();
    userDto.id = user.id;
    userDto.name = user.name;
    userDto.email = user.email;
    return userDto;
  }
}
