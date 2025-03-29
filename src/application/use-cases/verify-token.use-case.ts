import { UseCaseException } from '../exceptions/use-case.exception';

import { TokenApplicationDto, UserApplicationDto } from '../dto';
import { IJwtApplicationService } from '../service/jwt.service';

export class VerifyTokenUseCase {
  constructor(private readonly jwtService: IJwtApplicationService) {}

  execute(tokenApplicationDto: TokenApplicationDto): Promise<{
    user: Omit<UserApplicationDto, 'password'>;
    token: string;
  }> {
    const tokenData = this.validateToken(tokenApplicationDto.token);

    if (tokenData) {
      return Promise.resolve({
        user: tokenData.user,
        token: this.generateToken(tokenData.user),
      });
    }

    throw new UseCaseException('Invalid token', new Map<string, boolean>());
  }

  private validateToken(token: string): {
    user: Omit<UserApplicationDto, 'password'>;
    token: string;
  } {
    return this.jwtService.verifyToken(token);
  }

  private generateToken(data: Omit<UserApplicationDto, 'password'>): string {
    return this.jwtService.generateToken(data);
  }
}
