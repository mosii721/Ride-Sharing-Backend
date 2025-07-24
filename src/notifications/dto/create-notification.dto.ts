import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { NotificationType } from "../entities/notification.entity";
import { ApiProperty } from "@nestjs/swagger";


export class CreateNotificationDto {
    @ApiProperty({
                    description: 'ID of the user getting the notification'})
    @IsString()
    userId: string;

    @ApiProperty({
                    description: 'notification message',example:'New Booking'})
    @IsString()
    message: string;

    @ApiProperty({
                    description: 'Is the message read ',example: true})
    @IsBoolean()
    @IsOptional()
    isRead: boolean = false;

    @ApiProperty({
                    description: 'Type of the booking',
                    example: 'BookingConfirmation',
                    enum: NotificationType,
                    enumName: 'Type'
            })
    @IsEnum(NotificationType)
    type: NotificationType = NotificationType.BOOKINGCONFIRMATION
}







