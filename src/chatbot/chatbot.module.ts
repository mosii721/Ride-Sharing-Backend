import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { RolesGuard } from 'src/auth/guards';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User])],
  controllers: [ChatbotController],
  providers: [ChatbotService,RolesGuard],
})
export class ChatbotModule {}
