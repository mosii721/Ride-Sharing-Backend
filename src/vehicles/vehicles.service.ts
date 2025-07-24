import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VehiclesService {

  constructor(@InjectRepository(Vehicle) private readonly vehicleRepository:Repository<Vehicle>){}

  async create(createVehicleDto: CreateVehicleDto) {
    const existingVehicle = await this.vehicleRepository.findOne({ where:{licensePlate:createVehicleDto.licensePlate},select:['id']})

    if(existingVehicle){
      throw new Error('Vehicle with this license Plate already exists')
    }

    const newVehicle = this.vehicleRepository.create({
          model: createVehicleDto.model,
          type: createVehicleDto.type,
          licensePlate: createVehicleDto.licensePlate,
          capacity: createVehicleDto.capacity,
          status: createVehicleDto.status,
    })

        return await this.vehicleRepository.save(newVehicle)
  }

  async findAll(licensePlate?:string) {
    if (licensePlate) {
      return await  this.vehicleRepository.find({
        where:{licensePlate},
        relations:['driver','bookings']
      });
    }
    return await this.vehicleRepository.find({relations:['driver','bookings']});
  }

  async findOne(id: string) {
    return await this.vehicleRepository.findOneBy({id}).then((vehicle)=>{
      if(!vehicle){
        return  `vehicle  with  id  ${id} not found`
      }
      return  vehicle;
    }).catch((error)=>{
      console.error('Error finding user:',error);
      throw new Error(`User  with  id  ${id} not found`);
    });;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    await  this.vehicleRepository.update(id,updateVehicleDto);
    return this.findOne(id)
  }

  async remove(id: string) {
    return await  this.vehicleRepository.delete(id);
  }
}
