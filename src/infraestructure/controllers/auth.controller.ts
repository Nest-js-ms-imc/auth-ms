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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly application: Application,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  // @MessagePattern('auth.register.user')
  // registerUser(@Payload() registerUserDto: LoginUserDto) {
  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    try {
      const data = await this.application.newUser(
        registerUserDto.name,
        registerUserDto.email,
        registerUserDto.password,
        this.passwordHashService,
      );
      return data;
    } catch (error) {
      console.error(error, registerUserDto);
    }
  }

  // @MessagePattern('auth.login.user')
  // loginUser(@Payload() loginUserDto: LoginUserDto) {
  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    try {
      const data = await this.application.login(
        loginUserDto.email,
        loginUserDto.password,
        this.jwtService,
        this.userService,
        this.passwordHashService,
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  // @MessagePattern('auth.verify.user')
  // verifyToken(@Payload() token: string) {
  @Get('verifyToken')
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    try {
      const data = await this.application.verifyToken(
        verifyTokenDto.token,
        this.jwtService,
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  @Post('logout')
  async logout(@Body() logOutUserDto: LogOutUserDto) {
    try {
      return await this.application.logOut(logOutUserDto.token);
    } catch (error) {
      console.error(error);
    }
  }
}
