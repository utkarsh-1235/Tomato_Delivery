import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsercontrollerController } from './usercontroller/usercontroller.controller';
import { UserservicesService } from './userservices/userservices.service';
import { UserModuleModule } from './user-module/user-module.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';



// console.log("Database",process.env.DATABASE_URL)
// console.log("Database",process.env.SECRET_KEY)

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModuleModule,
    RedisModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');
        console.log('Loaded DB URL:', dbUrl); // ✅ correct place
    
        return {
          type: 'postgres',
          url: dbUrl,
          ssl: {
            rejectUnauthorized: false,
          },
          autoLoadEntities: true,
          synchronize: true,
          logging: true, // 🔥 enable logs
        };
      },
    })
    
  ],
  controllers: [AppController, UsercontrollerController],
  providers: [AppService, UserservicesService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
