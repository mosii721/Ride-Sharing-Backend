import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { RolesGuard } from 'src/auth/guards';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [DatabaseModule,TypeOrmModule.forFeature([Vehicle,User])],
  controllers: [VehiclesController],
  providers: [VehiclesService,RolesGuard],
})
export class VehiclesModule {}
