import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteStatus } from './entities/route.entity';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards';

@ApiTags('routes')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Roles(Role.ADMIN,Role.DRIVER)
  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @ApiQuery({
      required: false,
      description: 'Get all routes'
    })
  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Roles(Role.ADMIN,Role.DRIVER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(id, updateRouteDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }

  @Roles(Role.ADMIN,Role.DRIVER)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: RouteStatus }) {
    return this.routesService.updateStatus(id, body.status);
  }
}
