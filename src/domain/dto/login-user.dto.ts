import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

// TODO: Revisar las validaciones de negocio
export class LoginUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
