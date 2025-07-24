import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
   private readonly transporter;
   constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendLoginEmail(to: string, name: string) {
    const mailOptions = {
      from: `"Ride Sharing" <${this.configService.get<string>('EMAIL_USER')}>`,
      to,
      subject: 'Login Notification',
      text: `Hello ${name},\n\nYou have successfully logged in to your ride sharing account.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Login email sent:', info.response);
      return info;
    } catch (error) {
      console.error('Error sending login email:', error);
      throw error;
    }
  }

  async sendRegistrationEmail(to: string, name: string) {
  const mailOptions = {
    from: `"Ride Sharing" <${this.configService.get<string>('EMAIL_USER')}>`,
    to,
    subject: 'Welcome to Our App!',
    text: `Hi ${name},\n\nThank you for registering for ride share. We're glad to have you on board!\n\nBest regards,\nYour App Team`,
  };

  try {
    const info = await this.transporter.sendMail(mailOptions);
    console.log('Registration email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw error;
  }
}
}