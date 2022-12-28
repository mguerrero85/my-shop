import { UnauthorizedException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
      @InjectRepository(User)
      private usersRepository: Repository<User>,
      configService: ConfigService
    ) {
      super({
        secretOrKey: configService.get('JWT_SECRET'),
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
      });
    }


    async validate(payload: JwtPayload): Promise<User> {

      const { id } = payload;

      const user = await  this.usersRepository.findOneBy({ id });
        
      if(!user)
        throw new UnauthorizedException('Token not valid'); 
      
      if(!user.isActive)
        throw new UnauthorizedException('User is inactive, talk with an admin');

      console.log({ user });

      return user;

    }
}