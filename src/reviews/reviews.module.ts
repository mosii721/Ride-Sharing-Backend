import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { RolesGuard } from 'src/auth/guards';
import { Booking } from 'src/bookings/entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Notification } from 'src/notifications/entities/notification.entity';

@Module({
  imports:[DatabaseModule,TypeOrmModule.forFeature([Review,Booking,User,Driver,Notification])],
  controllers: [ReviewsController],
  providers: [ReviewsService,RolesGuard,NotificationsService],
})
export class ReviewsModule {}
