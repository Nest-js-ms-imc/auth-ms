import { UserModel } from 'src/infraestructure/persistence/models/user.model';

export interface IUserDomainService {
  validateUserAndPassword(
    email: string,
    password: string,
  ): Promise<{ user: Omit<UserModel, 'password'>; token: string }>;
}
