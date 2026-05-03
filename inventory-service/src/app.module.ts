import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import dns from 'node:dns';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dnsServersEnv = config
          .get<string>('DNS_SERVERS')
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (dnsServersEnv?.length) dns.setServers(dnsServersEnv);

        const databaseUrl = config.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not set (check order-service/.env or environment variables)');
        }
        return { uri: databaseUrl };
      },
    }),
    InventoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
