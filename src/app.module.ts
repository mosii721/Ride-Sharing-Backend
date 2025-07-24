import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DriversModule } from './drivers/drivers.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { BookingsModule } from './bookings/bookings.module';
import { RoutesModule } from './routes/routes.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LogsModule } from './logs/logs.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guards';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from './logger.middleware';
import { ChatbotModule } from './chatbot/chatbot.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:'.env',
    }),DriversModule,
    UsersModule,
    VehiclesModule,
    BookingsModule,
    RoutesModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    LogsModule,
    DatabaseModule,
    AuthModule,
    ThrottlerModule.forRoot({
      throttlers:[{
        ttl:60000,
        limit:100,
        ignoreUserAgents:[/^curl\//,/^PostmanRuntime\//], // excludes them from rate-limiting
      }]
    }),
    ChatbotModule,
    MailModule
    // CacheModule.registerAsync({
    //   imports:[ConfigModule],
    //   inject: [ConfigService],
    //   isGlobal:true,
    //   useFactory:(configService:ConfigService)  =>  {
    //     return {
    //       ttl:120000,
    //       stores:[
    //         new Keyv  ({
    //           store: new CacheableMemory ({ttl:30000,lruSize:5000}),
    //         }),
    //         createKeyv(configService.getOrThrow<string>('REDIS_URL')),
    //       ],
    //     };
    //   },
    // }),
  ],
  controllers: [],
  providers: [{
    //   provide: 'APP_INTERCEPTOR',
  //   useClass: CacheInterceptor,// global interceptor to cache responses
  // },
  // {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,// global guard to limit requests to 100 per minute
  },
  {
    provide: APP_GUARD,
    useClass: AtGuard,  // global guard to protect all routes with access token
  },
  ],
})
export class AppModule implements NestModule {
  configure(consumer:MiddlewareConsumer){
    consumer.apply(LoggerMiddleware).forRoutes('vehicles','users','routes','reviews','payments','notifications','drivers','bookings')
  }
}
