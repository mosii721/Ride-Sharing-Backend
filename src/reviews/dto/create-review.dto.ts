import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";


export class CreateReviewDto {
    @ApiProperty({
                    description: 'ID of the booking being reviewed'})
    @IsString()
    bookingId: string;

    @ApiProperty({
                    description: 'ID of the user reviewing'})
    @IsString()
    reviewerId: string;

    @ApiProperty({
                    description: 'ID of the driverbeing reviewed', required: false})
    @IsString()
    @IsOptional()
    driverId: string;

    @ApiProperty({
            description: 'Rating off the booking', example: 4})
    @IsNumber()
    @Min(0)
    @Max(5)
    rating: number;

    @ApiProperty({
            description: 'Comments on the ride or booking or driver', example: 'The ride was very good'})
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(1000)
    comment: string;
}




