import { UserApplicationDto } from 'src/application/dto';
import { IUserModel } from '../models/user.model';

export interface IUserRepository<User extends IUserModel> {
  registerUser(user: UserApplicationDto): Promise<User>;
  loginUser(
    user: Omit<UserApplicationDto, 'id' | 'name'>,
  ): Promise<{ user: Omit<User, 'password'>; token: string }>;
  findByEmail(email: string): Promise<User | null>;
  deleteUser(email: string): Promise<User>;
  logout(token: string): Promise<string>;
}
