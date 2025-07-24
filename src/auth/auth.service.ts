import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import  * as  Bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
  private readonly jwtService:JwtService,
  private readonly configService:ConfigService,
  private readonly mailService: MailService){}

  private async getTokens(userId:string, email:string,role:string){
    const [at,rt] = await Promise.all([
      this.jwtService.signAsync({sub:userId,email:email,role:role},{
        secret: this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_SECRET'
        ),
        expiresIn:this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EXPIRES_IN'
        ),
      }),
      this.jwtService.signAsync({
        sub: userId,
        email: email,
        role: role,
      },{
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_SECRET'
        ),
        expiresIn:this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_EXPIRES_IN'
        ),
      })
    ]);
    return {
      accessToken: at,
      refreshToken: rt,
    }
  }

  private async hashToken(token:string):Promise<string>{
    const salt = await Bcrypt.genSalt(10);
    return Bcrypt.hash(token,salt)
  }

  private async saveRefreshToken(userId:string, refreshToken:string){
    const hashedRefreshToken = await this.hashToken(refreshToken);
    await this.userRepository.update(userId,{
      hashedRefreshToken: hashedRefreshToken,
    })
  }
  
  async logIn(createAuthDto: CreateAuthDto){
    const foundUser = await this.userRepository.findOne({ where:{email:createAuthDto.email}, select:['id','email','password','role','active','name']})
    if(!foundUser){
      throw new NotFoundException(`User with email ${createAuthDto.email} not found`)
    };
    const foundPassword = await Bcrypt.compare(createAuthDto.password, foundUser.password)

    if(!foundPassword){
      throw new NotFoundException('wrong credentials')
    }

    const {accessToken,refreshToken} = await this.getTokens(
      foundUser.id,
      foundUser.email,
      foundUser.role,
    )

    await this.saveRefreshToken(foundUser.id, refreshToken)
    await this.mailService.sendLoginEmail(foundUser.email,foundUser.name);

    return { data:{tokens:{accessToken,refreshToken},
      user:{
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        active: foundUser.active,
      }
    }
    }
  }

  async signOut(userId:string){
    const foundUser = await this.userRepository.findOne({ where:{id:userId},select:['id','email','hashedRefreshToken']})

    if (!foundUser){
      throw new NotFoundException(`User with id not Found`)
    }
    await this.userRepository.update(userId,{
      hashedRefreshToken:null,
    });

    return {message: 'Signed out Successfully'};
  }

  async refreshTokens(id:string, refreshToken:string){
    const foundUser = await this.userRepository.findOne({ where:{id}, select:['id','email','hashedRefreshToken','role']})
    if(!foundUser){
      throw new NotFoundException('User with id not Found')
    }
    if(!foundUser.hashedRefreshToken){
      throw new NotFoundException('User has no refresh token')
    }

    const isRefreshTokenValid = await Bcrypt.compare(refreshToken,foundUser.hashedRefreshToken)
    if(!isRefreshTokenValid){
      throw new NotFoundException('Invalid refresh token')
    };

    const {accessToken,refreshToken:newRefreshToken} = await this.getTokens(foundUser.id, foundUser.email, foundUser.role)

    await this.saveRefreshToken(foundUser.id, newRefreshToken);
    return {accessToken,refreshToken:newRefreshToken}
  }
}
