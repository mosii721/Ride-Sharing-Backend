import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { RolesGuard } from 'src/auth/guards';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { User } from 'src/users/entities/user.entity';
import { Driver } from 'src/drivers/entities/driver.entity';

@Module({
  imports:[DatabaseModule,TypeOrmModule.forFeature([Route,User,Driver])],
  controllers: [RoutesController],
  providers: [RoutesService,RolesGuard],
})
export class RoutesModule {}
