import { Controller, Body, Post, Get } from '@nestjs/common';

import { Application } from '../../application/application.interface';
import { PasswordHashService } from '../services/password-hash.service';
import { JwtService } from '../services/jwt.service';
import { UserService } from '../services/user.service';
import {
  RegisterUserDto,
  LoginUserDto,
  VerifyTokenDto,
  LogOutUserDto,
} from '../../domain/dto';
import { RedisService } from '../services';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly application: Application,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly passwordHashService: PasswordHashService,
    private readonly redisService: RedisService,
  ) {}

  @MessagePattern('auth.register.user')
  async registerUser(@Payload() registerUserDto: RegisterUserDto) {
    // @Post('register')
    // async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return await this.application.newUser(
      registerUserDto.name,
      registerUserDto.email,
      registerUserDto.password,
      this.passwordHashService,
    );
  }

  @MessagePattern('auth.login.user')
  async loginUser(@Payload() loginUserDto: LoginUserDto) {
    // @Post('login')
    // async loginUser(@Body() loginUserDto: LoginUserDto) {
    return await this.application.login(
      loginUserDto.email,
      loginUserDto.password,
      this.jwtService,
      this.userService,
      this.passwordHashService,
      this.redisService,
    );
  }

  @MessagePattern('auth.verify.user')
  async verifyToken(@Payload() verifyTokenDto: VerifyTokenDto) {
    // @Get('verifyToken')
    // async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    return await this.application.verifyToken(
      verifyTokenDto.token,
      this.jwtService,
    );
  }

  @MessagePattern('auth.logout.user')
  async logout(@Payload() logOutUserDto: LogOutUserDto) {
    // @Post('logout')
    // async logout(@Body() logOutUserDto: LogOutUserDto) {
    return await this.application.logOut(logOutUserDto.token);
  }
}
