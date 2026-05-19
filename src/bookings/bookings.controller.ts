import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, RouteInfoDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { RolesGuard } from 'src/auth/guards';
import { HttpService } from '@nestjs/axios';
import { BookingStatus } from './entities/booking.entity';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService,
    private readonly httpService: HttpService
  ) {}

  @Roles(Role.ADMIN,Role.CUSTOMER)
  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @ApiQuery({
      required: false,
      description: 'Get all bookings'
    })
  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get('locations')
  getSuggestions(@Query('s') searchText: string) {
    return this.bookingsService.getSuggestions(searchText);
  }

  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Roles(Role.ADMIN,Role.CUSTOMER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }

@Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
@Patch(':id/status')
updateStatus(@Param('id') id: string, @Body() body: { status: BookingStatus }) {
  return this.bookingsService.updateStatus(id, body.status);
}

  
  @Post('route-info')
  async getRouteInfo(@Body() routeInfoDto: RouteInfoDto) {
    return this.bookingsService.getRouteInfo(routeInfoDto.pickup, routeInfoDto.dropoff);
  }
}
