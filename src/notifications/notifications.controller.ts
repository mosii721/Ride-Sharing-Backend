import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @ApiQuery({
        required: false,
        description: 'Get all notifications'
      })
  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
