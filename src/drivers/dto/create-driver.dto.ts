import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";


export class UpdateLocationDto {
  @ApiProperty({ example: 37.7749 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -122.4194 })
  @IsNumber()
  longitude: number;
}


export class CreateDriverDto {
     @ApiProperty({
                    description: 'ID of the driver users profile'})
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
                    description: 'License Number of the driver',example: '20040205MMK05'})
    @IsString()
    @IsNotEmpty()
    licenseNumber: string;

    @ApiProperty({
                    description: 'ID of the vehicle assigned to the driver is optional though', required: false})
    @IsString()
    @IsOptional()
    vehicleId: string;

    @ApiProperty({
        description: 'Rating off the driver', example: 4, required: false})
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(5)
    rating: number;

    @ApiProperty({
    description: 'Availability status of the driver',
    example: true,
    required: false
  })
    @IsBoolean()
    available: boolean;
}

  


