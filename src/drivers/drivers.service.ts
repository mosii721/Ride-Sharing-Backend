import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';

@Injectable()
export class DriversService {

  constructor(@InjectRepository(Driver) private readonly driverRepository:Repository<Driver>,
    @InjectRepository(User) private readonly userRepository:Repository<User>,
    @InjectRepository(Vehicle) private readonly vehicleRepository:Repository<Vehicle>,){}

  async create(createDriverDto: CreateDriverDto) {
    const existUser  = await this.userRepository.findOneBy({id: createDriverDto.userId});
    
        if(!existUser ){
          throw new NotFoundException(`User   with  id  ${createDriverDto.userId}  not found`);
        }

        let vehicle: Vehicle | null = null;
        if (createDriverDto.vehicleId) {
          vehicle = await this.vehicleRepository.findOneBy({ id: createDriverDto.vehicleId });
        if (!vehicle) {
        throw new NotFoundException(`Vehicle with id ${createDriverDto.vehicleId} not found`);
      }
    }

        const newDriver = this.driverRepository.create({
          licenseNumber:createDriverDto.licenseNumber,
          rating:createDriverDto.rating,
          available: createDriverDto.available ?? true,
          user:existUser,
          vehicle:vehicle ?? undefined,
        })
        return  await this.driverRepository.save(newDriver)
      }

  async findAll(name?: string) {
    if (name) {
      return await  this.driverRepository.find({
        where:{user:{name:name},},
        relations:['user','vehicle','reviews','bookings','reviews.reviewer']
      });
    }
    return await this.driverRepository.find({relations:['user','vehicle','reviews','bookings','reviews.reviewer']});
  }

  async findOne(id: string) {
    return await  this.driverRepository.find({
      where:{id},
        relations:['user','vehicle','reviews','bookings','reviews.reviewer']
    });
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    return await this.driverRepository.update(id,updateDriverDto);
  }

  async remove(id: string) {
    return await  this.driverRepository.delete(id);
  }

  async findByUserId(userId: string): Promise<Driver | null> {
  const driver = await this.driverRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user', 'vehicle', 'reviews', 'bookings','reviews.reviewer'],
  });

  if (!driver) {
    throw new NotFoundException(`No driver profile found for user ID ${userId}`);
  }

  return driver;
}

async updateLocation(id: string, latitude: number, longitude: number) {
  const driver = await this.driverRepository.findOneBy({ id });
  if (!driver) {
    throw new NotFoundException(`Driver with ID ${id} not found`);
  }

  driver.lastLatitude = latitude;
  driver.lastLongitude = longitude;
  driver.lastLocationUpdate = new Date();

  return await this.driverRepository.save(driver);
}

async getAllDriverLocations() {
  try {
  const drivers = await this.driverRepository.find({
    select: ['id', 'lastLatitude', 'lastLongitude','available'],
    relations: ['user', 'vehicle'],
    where: {
      lastLatitude: Not(IsNull()),
      lastLongitude: Not(IsNull()),
    },
  });
  console.log(drivers);
  
  return drivers.map((driver) => ({
    id: driver.id,
    driverName: driver.user.name,
    driverVehiclePlate: driver.vehicle.licensePlate,
    driverVehicleModel: driver.vehicle.model,
    latitude: driver.lastLatitude,
    longitude: driver.lastLongitude,
    available: driver.available,
  }));
   } catch (error) {
    console.error('Error fetching driver locations:', error);
    throw new InternalServerErrorException('Failed to fetch driver locations');
  }
}

// src/drivers/drivers.service.ts
async updateAvailability(id: string, available: boolean) {
  const driver = await this.driverRepository.findOneBy({ id });
  if (!driver) {
    throw new NotFoundException(`Driver with ID ${id} not found`);
  }

  driver.available = available;
  return await this.driverRepository.save(driver);
}

}



