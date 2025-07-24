import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { DatabaseModule } from 'src/database/database.module';
import { RolesGuard } from 'src/auth/guards';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [DatabaseModule,TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService,RolesGuard,MailService],
})
export class UsersModule {}
