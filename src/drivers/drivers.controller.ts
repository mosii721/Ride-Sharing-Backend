import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateLocationDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { RolesGuard } from 'src/auth/guards';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';

@ApiTags('drivers')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @ApiQuery({
        required: false,
        description: 'Get all drivers or by their user name'
      })
  @Get()
  @Roles(Role.ADMIN,Role.DRIVER)
  findAll(@Query('name') name?: string) {
    if(name){
      return this.driversService.findAll(name);
    }
    return this.driversService.findAll();
  }

  @Roles(Role.ADMIN, Role.CUSTOMER,Role.ADMIN) // or anyone you want to allow
@Get('locations')
async getAllDriverLocations() {
  return this.driversService.getAllDriverLocations();
}

  @Get(':id')
  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }

  @Roles(Role.ADMIN,Role.DRIVER)
  @Get('by-user/:userId')
  findByUserId(@Param('userId') userId: string) {
  return this.driversService.findByUserId(userId);
}

@Patch(':id/location')
@Roles(Role.DRIVER)
updateLocation(@Param('id') id: string,@Body() location: UpdateLocationDto) {
  return this.driversService.updateLocation(id, location.latitude, location.longitude);
}

@Patch(':id/availability')
async updateAvailability(@Param('id') id: string,@Body('available') available: boolean,) {
  return this.driversService.updateAvailability(id, available);
}

}
