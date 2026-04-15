import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWTStrategy } from 'src/auth/jwt.strategy';
import { RedisModule } from 'src/redis/redis.module';
import { User } from 'src/user/user.entity';
import { UsercontrollerController } from 'src/usercontroller/usercontroller.controller';
import { UserservicesService } from 'src/userservices/userservices.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              secret: config.get<string>('SECRET_KEY'),
              signOptions: { expiresIn: '300s' },
            }),
          }),
         RedisModule
        ],
    providers: [UserservicesService, JWTStrategy],
    controllers: [UsercontrollerController],
    exports: [TypeOrmModule, JwtModule]
})
export class UserModuleModule {}
