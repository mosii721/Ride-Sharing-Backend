import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { RolesGuard } from 'src/auth/guards';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';

@Module({
  imports:[DatabaseModule,TypeOrmModule.forFeature([Driver,User,Vehicle])],
  controllers: [DriversController],
  providers: [DriversService,RolesGuard],
})
export class DriversModule {}
