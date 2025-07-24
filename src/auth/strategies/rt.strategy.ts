import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from "passport-jwt";

type JWTPayload = {
    sub: string;
    email: string;
}

interface JWTPayloadWithRt extends JWTPayload{
    refreshToken: string;
}

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-rt'){

    constructor(private readonly configService: ConfigService){
        const options: StrategyOptionsWithRequest ={
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
            passReqToCallback: true,
        }
        super(options);
    }

    validate(req:Request,payload:JWTPayload): JWTPayloadWithRt {
        const authHeader = req.get('Authorization');

        if(!authHeader){
            throw new UnauthorizedException('no refresh token provided');
        }

        const refreshToken = authHeader.replace('Bearer','').trim();
        if(!refreshToken){
            throw new UnauthorizedException('Invalid refresh token');
        }
        return{
            ...payload,
            refreshToken,
        }
    }
}