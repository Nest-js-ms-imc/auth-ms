import { UserApplicationDto } from '../dto';

export interface IJwtApplicationService {
  generateToken(payload: Omit<UserApplicationDto, 'password'>): string;
  verifyToken(token: string): {
    user: Omit<UserApplicationDto, 'password'>;
    token: string;
  };
}
