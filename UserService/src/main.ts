import { NestFactory } from '@nestjs/core';
import { webcrypto } from 'crypto';

async function bootstrap() {
  // @nestjs/typeorm expects a global `crypto` in some Node runtimes (e.g. node:18-alpine).
  // Ensure it's available before loading AppModule / TypeOrm modules.
  (globalThis as any).crypto ??= webcrypto as any;

  // With `moduleResolution: nodenext`, use the emitted `.js` extension in import paths.
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
