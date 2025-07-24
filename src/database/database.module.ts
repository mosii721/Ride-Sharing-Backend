import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.getOrThrow<string>('DATABASE_URL'),
                ssl: { rejectUnauthorized: false }, // Required for Neon
                autoLoadEntities: true,
                synchronize: configService.get<boolean>('DB_SYNC', true),
                logging: configService.get<boolean>('DB_LOGGING', false),
                migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [],
})
export class DatabaseModule {}
