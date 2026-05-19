import { LocationDto } from "src/bookings/dto/create-booking.dto";
import { RouteStatus } from "../entities/route.entity";
import { IsDateString, IsEnum, IsNumber, IsObject, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRouteDto {
    @ApiProperty({
                    description: 'ID of the driver'})
    @IsString()
    driverId: string;

    @ApiProperty({
    description: 'Start location details',
    type: () => LocationDto, 
    })
    @IsObject()
    @ValidateNested()
    @Type(() => LocationDto)
    startLocation:LocationDto;

    @ApiProperty({
    description: 'End location details',
    type: () => LocationDto, 
    })
    @IsObject()
    @ValidateNested()
    @Type(() => LocationDto)
    endLocation:LocationDto;

    @ApiProperty({
                    description: 'Available seats for the route',example: 3})
    @IsNumber()
    availableSeats: number;

    @ApiProperty({
                    description: 'Depature time',example: '8:00'})
    @IsString()
    departureTime: string;

    @ApiProperty({
                    description: 'Status of the route',
                    example: 'Open',
                    enum: RouteStatus,
                    enumName: 'Status'
            })
    @IsEnum(RouteStatus)
    status: RouteStatus=RouteStatus.OPEN;
}


















 
    
