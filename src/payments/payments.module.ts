import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { RolesGuard } from 'src/auth/guards';
import { User } from 'src/users/entities/user.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Driver } from 'src/drivers/entities/driver.entity';

@Module({
  imports:[DatabaseModule,TypeOrmModule.forFeature([Payment,User,Booking,Driver])],
  controllers: [PaymentsController],
  providers: [PaymentsService,RolesGuard],
})
export class PaymentsModule {}
