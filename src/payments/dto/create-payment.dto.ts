import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentMethod, PaymentStatus } from "../entities/payment.entity";
import { ApiProperty } from "@nestjs/swagger";


export class CreatePaymentDto {
    @ApiProperty({
                    description: 'ID of the user paying'})
    @IsString()
    userId: string;

    @ApiProperty({
                    description: 'ID of the booking being payed for', required: false})
    @IsString()
    @IsOptional()
    bookingId: string;

    @ApiProperty({
                    description: 'amount payed', example: 500})
    @IsNumber()
    amount: number;

    @ApiProperty({
                    description: 'Transaction Id ',  example: '#TRD6708Y'})
    @IsString()
    transactionId: string;

    @ApiProperty({
                    description: 'Method of the payment',
                    example: 'Mpesa',
                    enum: PaymentMethod,
                    enumName: 'Method'
            })
    @IsEnum(PaymentMethod)
    method: PaymentMethod= PaymentMethod.CASH;

    @ApiProperty({
                    description: 'Status of the payment',
                    example: 'Pending',
                    enum: PaymentStatus,
                    enumName: 'Status'
            })
    @IsEnum(PaymentStatus)
    status: PaymentStatus = PaymentStatus.PENDING;
}

