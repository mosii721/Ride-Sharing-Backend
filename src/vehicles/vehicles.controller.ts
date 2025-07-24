import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { RolesGuard } from 'src/auth/guards';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @ApiQuery({
      required: false,
      description: 'Get all vehicles'
    })
  @Roles(Role.ADMIN,Role.DRIVER,Role.CUSTOMER)
  @Get()
  findAll(@Query('licensePlate')licensePlate?:string) {
    if(licensePlate){
      return this.vehiclesService.findAll(licensePlate);
    }
    return this.vehiclesService.findAll();
  }

  @Roles(Role.ADMIN,Role.DRIVER,Role.CUSTOMER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
