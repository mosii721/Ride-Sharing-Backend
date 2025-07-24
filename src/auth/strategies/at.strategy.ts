import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export type JWTPayload = {
    sub: string; //subject, usually the user ID
    email:string;
    role:string;
}

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy,'jwt-at'){

    constructor(private readonly configService: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    validate(payload:JWTPayload): JWTPayload {
        return payload;
    }
}