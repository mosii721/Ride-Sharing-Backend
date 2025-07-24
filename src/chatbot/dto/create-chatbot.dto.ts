import { IsNotEmpty, IsString } from "class-validator";

export class CreateChatbotDto {
    @IsString()
    @IsNotEmpty()
    message: string;
}
