import { UserPresentationDto } from '../dto';

export interface IJwtPresentationService {
  generateToken(payload: Omit<UserPresentationDto, 'password'>): string;
  verifyToken(token: string): {
    user: Omit<UserPresentationDto, 'password'>;
    token: string;
  };
}
