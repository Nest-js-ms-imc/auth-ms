import { Domain } from 'src/domain/domain.interface';
import { Application } from './application.interface';
import { UserApplicationDto } from './dto/user.dto';
import { IUserModel } from './persistence/models/user.model';
import { IUserRepository } from './persistence/repositories/user.repository';
import { IJwtApplicationService } from './service/jwt.service';
import {
  LogOutUseCase,
  NewUserUseCase,
  SignInUseCase,
  VerifyTokenUseCase,
} from './use-cases';
import {
  IPasswordHashDomainService,
  IUserDomainService,
} from '@/domain/services';
import { RedisService } from '@/infraestructure/services';

export class ApplicationController extends Application {
  constructor(
    private readonly userRepository: IUserRepository<IUserModel>,
    private readonly domainController: Domain,
  ) {
    super();
  }

  newUser(
    name: string,
    email: string,
    password: string,
    passwordHashService: IPasswordHashDomainService,
  ): Promise<UserApplicationDto> {
    const useCase = new NewUserUseCase(
      this.userRepository,
      this.domainController,
      passwordHashService,
    );
    return useCase.execute({ name, email, password });
  }

  async login(
    email: string,
    password: string,
    jwtService: IJwtApplicationService,
    userService: IUserDomainService,
    passwordHashService: IPasswordHashDomainService,
    redisService: RedisService,
  ): Promise<string> {
    const useCase = new SignInUseCase(
      this.userRepository,
      this.domainController,
      jwtService,
      userService,
      passwordHashService,
      redisService,
    );
    const data = await useCase.execute({ email, password });
    return data.token;
  }

  async verifyToken(
    token: string,
    jwtService: IJwtApplicationService,
  ): Promise<{
    id: string;
    name: string;
    email: string;
    token: string;
  }> {
    const useCase = new VerifyTokenUseCase(jwtService);
    const data = await useCase.execute({ token });
    return {
      id: data?.user.id ?? '',
      name: data?.user.name ?? '',
      email: data?.user.email ?? '',
      token: data?.token ?? '',
    };
  }

  async logOut(token: string): Promise<string> {
    const useCase = new LogOutUseCase(this.userRepository);

    return await useCase.execute({ token });
  }
}
