import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/guards';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from './entities/user.entity';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiQuery({
      required: false,
      description: 'Get all users'
    })
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query('email')email?:string) {
    if(email){
      return this.usersService.findAll(email);
    }
    return this.usersService.findAll();
  }

  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/active')
async updateActive(@Param('id') id: string,@Body('active') active: boolean,) {
  return this.usersService.updateActive(id, active);
}
}
