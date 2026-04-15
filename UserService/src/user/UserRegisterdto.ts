import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from './Role';

export class UserDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(10)
    password: string;

    @IsEnum(Role)
    role: Role;
}