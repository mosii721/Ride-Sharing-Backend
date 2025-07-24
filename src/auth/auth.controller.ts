import { Controller, Get, Post, Body, Param, UseGuards, Query, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Request } from 'express';
import { AtGuard, RtGuard } from './guards';
import { Public } from './decorators/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface RequestWithUser extends Request{
  user:{
    sub:string;
    email:string;
    refreshToken:string;
  };
}

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  logIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.logIn(createAuthDto);
  }

  @UseGuards(AtGuard)
  @Get ('signout/:id')
  async signOut(@Param('id')id:string ){
    return await this.authService.signOut(id)
  }
 
  @Public()
  @UseGuards(RtGuard)
  @Get ('refresh')
  refreshTokens(@Query('id')id:string,@Req() req:RequestWithUser){
    const user = req.user;
    if(user.sub !== id){
      throw new UnauthorizedException('Id Mismatch');
    }
    return this.authService.refreshTokens(id, user.refreshToken)
  }
}

