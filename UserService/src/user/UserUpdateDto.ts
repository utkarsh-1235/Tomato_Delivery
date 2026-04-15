import { IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "./Role";

export class UserUpdateDto{
    @IsOptional()
    @IsString()
    firstName: string

    @IsOptional()
    @IsString()
    lastName: string

    @IsOptional()
    @IsEnum(Role)
    role: Role

}