import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Route, RouteStatus } from './entities/route.entity';

@Injectable()
export class RoutesService {

  constructor(@InjectRepository(Driver) private readonly driverRepository:Repository<Driver>,
    @InjectRepository(Route) private readonly  routeRepository:Repository<Route>,){}

  async create(createRouteDto: CreateRouteDto) {
    const existDriver  = await this.driverRepository.findOneBy({id: createRouteDto.driverId});
    
        if(!existDriver){
          throw new NotFoundException(`Driver  with  id  ${createRouteDto.driverId}  not found`);
        }
        const newRoute = this.routeRepository.create({
          startLocation:createRouteDto.startLocation,
          endLocation:createRouteDto.endLocation,
          availableSeats:createRouteDto.availableSeats,
          departureTime:createRouteDto.departureTime ,
          status:createRouteDto.status ?? 'Open',
          driver:existDriver,
        })
        return  await this.routeRepository.save(newRoute)
      }

  async findAll() {
    return await this.routeRepository.find({relations:['driver','driver.user','bookings']});
  }

  async findOne(id: string) {
    return await  this.routeRepository.find({
      where:{id},
        relations:['driver','driver.user','bookings']
    });
  }

  async update(id: string, updateRouteDto: UpdateRouteDto) {
    return await this.routeRepository.update(id,updateRouteDto);
  }

  async remove(id: string) {
    return await  this.routeRepository.delete(id);
  }
  
  async updateStatus(id: string, status: RouteStatus) {
    const route = await this.routeRepository.findOne({
    where: { id },
    relations: ['driver','driver.user','bookings'],
  });
  
    if (!route) {
      throw new NotFoundException(`route with id ${id} not found`);
    }
  
    route.status = status;
     const savedRoute = await this.routeRepository.save(route);
    
     return savedRoute;
}
}
