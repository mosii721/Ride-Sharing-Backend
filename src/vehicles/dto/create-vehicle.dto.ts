import { IsEnum, IsNumber, IsString } from "class-validator";
import { VehicleStatus, VehicleType } from "../entities/vehicle.entity";
import { ApiProperty } from "@nestjs/swagger";


export class CreateVehicleDto {
    @ApiProperty({
                    description: 'License Plate of the vehicle',example: 'KEA 345O'})
    @IsString()
    licensePlate: string;

    @ApiProperty({
                    description: 'Model of the vehicle',example: 'Audi'})
    @IsString()
    model: string;

    @ApiProperty({
                    description: 'Type of the vehicle',
                    example: 'Sedan',
                    enum: VehicleType,
                    enumName: 'Type'
            })
    @IsEnum(VehicleType)
    type:VehicleType=VehicleType.SEDAN;

    @ApiProperty({
                    description: 'Capacity of the vehicle',example: 5})
    @IsNumber()
    capacity: number;

    @ApiProperty({
                    description: 'Status of the vehicle',
                    example: 'Available',
                    enum: VehicleStatus,
                    enumName: 'Status'
            })
    @IsEnum(VehicleStatus)
    status:VehicleStatus=VehicleStatus.AVAILABLE;
}







