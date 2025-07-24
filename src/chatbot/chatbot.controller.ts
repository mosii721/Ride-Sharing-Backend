import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards';
import { Role } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';


@ApiTags('chatbot')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Post('message')
  handleMessage(@Body() chatMessageDto: CreateChatbotDto) {
    return this.chatbotService.handleChat(chatMessageDto);
  }
}
