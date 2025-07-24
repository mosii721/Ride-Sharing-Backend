import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AtStrategy, RtStrategy } from './strategies';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports:[DatabaseModule,TypeOrmModule.forFeature([User]),JwtModule.register({
    global:true,
  }),
  PassportModule
],
  controllers: [AuthController],
  providers: [AuthService,AtStrategy,RtStrategy,MailService],
})
export class AuthModule {}
