import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';
import * as Joi from 'joi';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './middleware/http-response.interceptor';
import {
  HttpExceptionFilter,
  JwtexceptionFilter,
} from './middleware/exception-filter';
import { SocketModule } from './app/socket/socket.module';
import { EventsGateway } from './app/socket/socket.gateway';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        PORT: Joi.number().default(8000),
      }),
    }),
    UsersModule,
    AuthModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: JwtexceptionFilter,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: AccessTokenGuard,
    // },
    AppService,
  ],
})
export class AppModule {}
