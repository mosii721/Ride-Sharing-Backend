import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { BookingStatus, BookingType } from "../entities/booking.entity";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class LocationDto {
    @ApiProperty({ example: -1.2921, description: 'Latitude of the location' })
    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @ApiProperty({ example: 36.8219, description: 'Longitude of the location' })
    @IsNumber()
    @IsNotEmpty()
    longitude: number;

    @ApiProperty({ example: '123 Main St', description: 'Street address' })
    @IsString()
    @IsNotEmpty()
    address: string;
}

export class CreateBookingDto {
    @ApiProperty({
                description: 'ID of the cutomer booking'})
    @IsString()
    customerId: string;

    @ApiProperty({
                description: 'ID of the driver being booked though is optional ', required: false})
    @IsString()
    @IsOptional()
    driverId: string;

    @ApiProperty({
                description: 'ID of the vehicle being booked '})
    @IsString()
    vehicleId: string;

    @ApiProperty({
                description: 'ID of the route being booked though is optional ', required: false})
    @IsString()
    @IsOptional()
    routeId: string;

    @ApiProperty({
                description: 'Type of the booking',
                example: 'PrivateRide',
                enum: BookingType,
                enumName: 'Type'
        })
    @ValidateIf((o) => o.type !== BookingType.CARPOOL || !!o.routeId)// Carpool only if route is chosen
    @IsEnum(BookingType)
    type: BookingType=BookingType.PRIVATERIDE;

    @ApiProperty({
    description: 'Pickup location details',
    type: () => LocationDto, 
    })
    @IsObject()
    @ValidateNested()//This tells class-validator to go inside the nested object and validate its properties based on their decorators
    @Type(() => LocationDto)// is transformed into an instance of LocationDto
    pickupLocation:LocationDto;

    @ApiProperty({
    description: 'Dropoff location details',
    type: () => LocationDto, 
    })
    @IsObject()
    @ValidateNested()
    @Type(() => LocationDto)
    dropoffLocation:LocationDto;

    @ApiProperty({
                description: 'Total price you will pay',example: 500, required: false})
    @IsNumber()
    @IsOptional()
    fare: number;

    @ApiProperty({
                description: 'Distance of the booking in km',example: 5, required: false})
    @IsNumber()
    @IsOptional()
    distance: number;

    @ApiProperty({
                description: 'Time it will take in mins',example: 30, required: false})
    @IsNumber()
    @IsOptional()
    estimatedTime: number;

    @ApiProperty({
                description: 'Type of the booking',
                example: 'Pending',
                enum: BookingStatus,
                enumName: 'Status'
        })
    @IsEnum(BookingStatus)
    status: BookingStatus=BookingStatus.PENDING;
}

export class RouteInfoDto {
    @IsObject()
    @ValidateNested()
    @Type(() => LocationDto)
    pickup: LocationDto;

    @IsObject()
    @ValidateNested()
    @Type(() => LocationDto)
    dropoff: LocationDto;
}













 



  



  