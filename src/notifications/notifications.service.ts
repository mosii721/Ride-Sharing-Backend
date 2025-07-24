import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {

  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
    @InjectRepository(Notification) private readonly notificationRepository:Repository<Notification>,){}

  async create(createNotificationDto: CreateNotificationDto) {
    const existUser  = await this.userRepository.findOneBy({id: createNotificationDto.userId});
    
        if(!existUser){
          throw new NotFoundException(`User  with  id  ${createNotificationDto.userId}  not found`);
        }
        const newNotification = this.notificationRepository.create({
          message:createNotificationDto.message,
          type:createNotificationDto.type,
          isRead:createNotificationDto.isRead,
          user:existUser,
        })
        return  await this.notificationRepository.save(newNotification)
      }

  async findAll() {
    return await this.notificationRepository.find({relations:[ 'user']});
  }

  async findOne(id: string) {
    return await  this.notificationRepository.find({
      where:{id},
        relations:[ 'user']
    });
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    return await this.notificationRepository.update(id,updateNotificationDto);
  }

  async remove(id: string) {
    return await  this.notificationRepository.delete(id);
  }
}
