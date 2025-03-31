import { UserApplicationDto } from '../dto';

export interface IJwtApplicationService {
  generateToken(payload: Omit<UserApplicationDto, 'password'>): string;
  verifyToken(token: string): Promise<{
    user: Omit<UserApplicationDto, 'password'>;
    token: string;
  }>;
}
