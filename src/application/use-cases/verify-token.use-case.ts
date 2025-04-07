import { UseCaseException } from '../exceptions/use-case.exception';

import { TokenApplicationDto, UserApplicationDto } from '../dto';
import { IJwtApplicationService } from '../service/jwt.service';

export class VerifyTokenUseCase {
  constructor(private readonly jwtService: IJwtApplicationService) {}

  async execute(tokenApplicationDto: TokenApplicationDto): Promise<
    | {
        user: Omit<UserApplicationDto, 'password'>;
        // token: string;
      }
    | undefined
  > {
    const tokenData = await this.validateToken(tokenApplicationDto.token);

    if (tokenData) {
      return {
        user: tokenData.user,
        // token: this.generateToken(tokenData.user),
      };
    }
  }

  private validateToken(token: string): Promise<{
    user: Omit<UserApplicationDto, 'password'>;
    token: string;
  }> {
    return this.jwtService.verifyToken(token);
  }

  // private generateToken(data: Omit<UserApplicationDto, 'password'>): string {
  //   return this.jwtService.generateToken(data);
  // }
}
