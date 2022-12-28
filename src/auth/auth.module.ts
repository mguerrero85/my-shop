import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategies';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ User ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    /*JwtModule.register({ 
      secret: process.env.JWT_SECRET,
      signOptions: { 
        expiresIn: '2h' 
      }
    })*/

    JwtModule.registerAsync({
      imports:[ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: async ( configService: ConfigService ) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    })
  ],
  exports: [ 
    TypeOrmModule, 
    JwtStrategy, 
    PassportModule, 
    JwtModule
  ]
})
export class AuthModule {}
