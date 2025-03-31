import { IsString } from 'class-validator';

export class LogOutUserDto {
  @IsString()
  token: string;
}
