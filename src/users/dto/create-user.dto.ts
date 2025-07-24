import { Role } from "../entities/user.entity";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateUserDto {
    @ApiProperty({description: 'Name',example:'John Doe' })
    @IsString()
    @IsNotEmpty()
    name:string;

    @ApiProperty({description: 'Email',example:'john@gmail.com' })
    @IsEmail()
    email:string;

    @ApiProperty({description: 'Password',example:'password123#' })
    @IsString()
    @IsNotEmpty()
    password:string;

    @ApiProperty({description: 'Phone number',example:'+1234567890' })
    @IsString()
    @IsNotEmpty()
    phone:string;

    @ApiProperty({
                description: 'Role',
                example: 'Customer',
                enum: Role,
                enumName: 'Role'
        })
    @IsEnum(Role,{
        message:'Role must be either: Customer,Admin,Driver'
    })
    role:Role=Role.CUSTOMER

    @ApiProperty({description: 'Profile Picture' })
    @IsString()
    @IsOptional()
    profilePicture?:string;

    @IsBoolean()
    active: boolean;
}


