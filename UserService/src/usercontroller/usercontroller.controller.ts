import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserLoginDto } from 'src/user/UserLoginDto';
import { UserDto } from 'src/user/UserRegisterdto';
import { UserUpdateDto } from 'src/user/UserUpdateDto';
import { UserservicesService } from 'src/userservices/userservices.service';  

@Controller('users')  //route: /users
export class UsercontrollerController {
   constructor(private readonly userService: UserservicesService){}

 @Post('register')   //route: /users/register
 registerUser(@Body() userDto: UserDto){
    return this.userService.CreateUser(userDto);
 }

  @Post('login')      //route: /users/login
  @HttpCode(HttpStatus.OK)
  loginUser(@Body() UserLoginDto: UserLoginDto){
    return this.userService.Login(UserLoginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')       //route: /users/profile
  @HttpCode(HttpStatus.OK)
  getUser(@Req() req){
     return this.userService.GetUserByEmail(req.user.email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')      //route: /users/logout
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any){
    const authHeader = req?.headers?.authorization ?? '';
    const token =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : '';

    return this.userService.logout(token);
  }

  @Put('update')
  updateUser(
   @Query('email')email: string,
   @Body() updateUserDto: UserUpdateDto
){
   return this.userService.update(email, updateUserDto);
}
}
