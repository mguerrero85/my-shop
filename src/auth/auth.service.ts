import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(CreateUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = CreateUserDto;
      const user = this.usersRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.usersRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
      
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(LoginUserDto: LoginUserDto) {

    const { email, password } = LoginUserDto;

    const user = await this.usersRepository.findOne({
      where: {
        email
      },
      select: { id: true, email: true, password: true }
    });

    if(!user)
      throw new UnauthorizedException('Credentials are not valid (email)');
    
    if(!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };

  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBError(error: any): never {
    if (error.code === '23505')
      throw new BadRequestException( error.detail );

    console.log();

    throw new InternalServerErrorException('Please check server logs');
  }
}
