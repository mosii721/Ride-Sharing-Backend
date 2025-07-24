import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { RolesGuard } from 'src/auth/guards';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports:[DatabaseModule,TypeOrmModule.forFeature([Notification,User])],
  controllers: [NotificationsController],
  providers: [NotificationsService,RolesGuard],
})
export class NotificationsModule {}
