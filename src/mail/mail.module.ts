import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[ConfigModule], // not necessary since it is global in app.module but added for clarity
  providers: [MailService],
})
export class MailModule {}
