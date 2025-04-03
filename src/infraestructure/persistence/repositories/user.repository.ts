import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserModel } from '../models/user.model';
import { UserApplicationDto } from 'src/application/dto';
import { IUserRepository } from '../../../application/persistence/repositories/user.repository';
import { PasswordHashService, RedisService } from '@/infraestructure/services';

@Injectable()
export class UserRepository implements IUserRepository<UserModel> {
  constructor(
    @InjectRepository(UserModel)
    readonly repository: Repository<UserModel>,
    readonly passwordHashService: PasswordHashService,
    readonly redisService: RedisService,
  ) {}

  async registerUser(user: UserApplicationDto): Promise<UserModel> {
    try {
      const data = this.mapUserApplicationDtoToUserModel(user);

      const email = await this.findByEmail(user.email);

      if (email) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      return await this.repository.save(data);
    } catch (err) {
      throw new RpcException({
        status: 400,
        message: err.message,
      });
    }
  }

  async loginUser(
    user: Omit<UserApplicationDto, 'id' | 'name'>,
  ): Promise<{ user: Omit<UserModel, 'password'>; token: string }> {
    const { email, password } = user;

    try {
      const user = await this.findByEmail(email);

      if (!user)
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });

      const isPasswordValid = this.passwordHashService.compare(
        password,
        user.password,
      );

      if (!isPasswordValid)
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });

      const { password: __, ...rest } = user;

      return {
        user: rest,
        token: 'this.signJWT(rest)',
      };
    } catch (err) {
      throw new RpcException({
        status: 400,
        message: err.message,
      });
    }
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return await this.repository.findOne({ where: { email, isActive: true } });
  }

  async deleteUser(email: string): Promise<UserModel> {
    const user = await this.findByEmail(email);

    if (!user)
      throw new RpcException({
        status: 400,
        message: 'User not found',
      });

    const updateData = {
      ...user,
      isActive: false,
      deleteAt: new Date(),
    };

    return await this.repository.save(updateData);
  }

  private mapUserApplicationDtoToUserModel(
    data: UserApplicationDto,
  ): UserModel {
    const user = new UserModel();
    user.id = data.id;
    user.name = data.name;
    user.email = data.email;
    user.password = data.password;
    user.createdAt = new Date();
    return user;
  }

  async logout(token: string): Promise<string> {
    await this.redisService.del(`authenticated:${token}`);
    return 'Successful logout';
  }
}
