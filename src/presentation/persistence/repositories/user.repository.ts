import { UserPresentationDto } from 'src/presentation/dto';
import { IUserModel } from '../models/user.model';

export interface IUserRepository<User extends IUserModel> {
  registerUser(user: UserPresentationDto): Promise<User>;
  loginUser(
    user: Omit<UserPresentationDto, 'id' | 'name'>,
  ): Promise<{ user: Omit<User, 'password'>; token: string }>;
  findByEmail(email: string): Promise<User | null>;
  deleteUser(email: string): Promise<User>;
}
