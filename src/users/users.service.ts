import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as Bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
  private readonly mailService: MailService,){}

  private async hashPassword(password: string):Promise<string>{
    const salt = await Bcrypt.genSalt(10);
    return Bcrypt.hash(password,salt)
  }

  async create(createUserDto: CreateUserDto):Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOne({ where:{email:createUserDto.email},select:['id']})

    if(existingUser){
      throw new Error('User with this email already exists')
    }

    const newUser:Partial<User> ={
      name: createUserDto.name,
      email: createUserDto.email,
      phone: createUserDto.phone,
      profilePicture: createUserDto.profilePicture,
      role: createUserDto.role,
      active: createUserDto.active ?? true,
      password: await this.hashPassword(createUserDto.password)
    }

    const savedUser = await this.userRepository.save(newUser)
    await this.mailService.sendRegistrationEmail(savedUser.email, savedUser.name);
    return savedUser;
  }

  async findAll(email?:string):Promise<Partial<User>[]> {
    let users:User[];
    if(email){
      users = await this.userRepository.find({
        where: {email},
        select:['id','name','email','phone','role','profilePicture','createdAt','UpdatedAt'],
        relations:['driver','bookingsAsCustomer','reviewsGiven','notifications','payments']
      });
    }else{
      users = await this.userRepository.find({
        select:['id','name','email','phone','role','profilePicture','createdAt','UpdatedAt'],
        relations:['driver','bookingsAsCustomer','reviewsGiven','notifications','payments']
      })
    }
    return users.map((user) => user);
  }

  async findOne(id: string) {
  return await this.userRepository.findOneBy({id}).then((user)=>{
      if(!user){
        return  `User  with  id  ${id} not found`
      }
      return  user;
    }).catch((error)=>{
      console.error('Error finding user:',error);
      throw new Error(`User  with  id  ${id} not found`);
    });;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await  this.userRepository.update(id,updateUserDto);
    return this.findOne(id)
  }

  async remove(id: string) {
    return await  this.userRepository.delete(id);
  }

  async updateActive(id: string, active: boolean) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
    user.active = active;
    return await this.userRepository.save(user);
  }
}
