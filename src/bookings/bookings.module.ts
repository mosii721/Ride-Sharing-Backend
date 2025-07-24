import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { RolesGuard } from 'src/auth/guards';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Route } from 'src/routes/entities/route.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { HttpModule } from '@nestjs/axios';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  imports:[DatabaseModule,HttpModule,TypeOrmModule.forFeature([Booking,User,Vehicle,Route,Driver,Notification])],
  controllers: [BookingsController],
  providers: [BookingsService,RolesGuard,NotificationsService],
})
export class BookingsModule {}
