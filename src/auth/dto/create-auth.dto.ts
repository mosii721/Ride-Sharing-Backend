import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class CreateAuthDto {
    @ApiProperty({
        description: 'Email address of the user',example: 'ma@gmail.com'})
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @ApiProperty({
        description: 'Password of the user', example: 'password'
    })
    @IsString()
    @IsNotEmpty()
    password:string;
}
