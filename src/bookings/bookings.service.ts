import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Booking, BookingStatus, BookingType } from './entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Route } from 'src/routes/entities/route.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, lastValueFrom } from 'rxjs';



@Injectable()
export class BookingsService {

  constructor(@InjectRepository(Booking) private readonly bookingRepository:Repository<Booking>,
    @InjectRepository(User) private  readonly userRepository:Repository<User>,
    @InjectRepository(Vehicle) private readonly  vehicleRepository:Repository<Vehicle>,
   @InjectRepository(Route) private readonly  routeRepository:Repository<Route>,
   private readonly  notificationsService: NotificationsService,
   private readonly httpService: HttpService,
   private readonly configService: ConfigService,
  ){}

  async create(createBookingDto: CreateBookingDto) {
    const existUser  = await this.userRepository.findOneBy({id: createBookingDto.customerId});
    const existVehicle = await this.vehicleRepository.findOne({where: { id: createBookingDto.vehicleId },relations: ['driver','driver.user'],});

    if(!existUser || !existVehicle){
              throw new NotFoundException(`User  with  id  ${createBookingDto.customerId}  &  ${createBookingDto.vehicleId}  not found`);
      }

    let route: Route | null = null;
        if (createBookingDto.routeId) {
          route = await this.routeRepository.findOneBy({ id: createBookingDto.routeId });
        if (!route) {
        throw new NotFoundException(`Route with id ${createBookingDto.routeId} not found`);
      }
    }

if (createBookingDto.type === BookingType.CARPOOL && !createBookingDto.routeId) {
  throw new Error('Carpool booking requires a predefined route.');
}

const ratePerKm = 50;
    const baseFare = createBookingDto.distance * ratePerKm;
    let finalFare = baseFare;

 const today = new Date();
const startOfDay = new Date(today.setHours(0, 0, 0, 0));
const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  if (route && createBookingDto.type === BookingType.CARPOOL) {
  const existingCarpoolBookings = await this.bookingRepository.find({
    where: {
      route: { id: route.id },
      type: BookingType.CARPOOL,
      status: In([BookingStatus.PENDING, BookingStatus.ACCEPTED]), // filters to check if the booking is either pending or accepted 
      createdAt: Between(startOfDay, endOfDay),
    },
  });
    if (existingCarpoolBookings.length >= route.availableSeats) {
    throw new BadRequestException('This carpool route is already fully booked for today.');
  }

  const numberOfPassengers = existingCarpoolBookings.length + 1;
  const totalFare = createBookingDto.distance * 70;
  finalFare = +(totalFare / numberOfPassengers).toFixed(2);
  console.log(`👥 Carpool total today: ${numberOfPassengers}, Fare per person: ${finalFare}`);


  for (const booking of existingCarpoolBookings) {
  booking.fare = finalFare;
  await this.bookingRepository.save(booking);
}
}

    
    const newBooking =this.bookingRepository.create({
              type:createBookingDto.type,
              dropoffLocation:route ? route.endLocation :createBookingDto.dropoffLocation,
              pickupLocation:route ? route.startLocation :createBookingDto.pickupLocation,
              distance:createBookingDto.distance,
              estimatedTime:createBookingDto.estimatedTime,
              fare: finalFare,
              status: createBookingDto.status || (existVehicle.driver ? 'Accepted' : 'Pending'),
              customer:existUser,
              vehicle:existVehicle,
              route: route ?? undefined,
              driver: existVehicle.driver
            })

    const savedBooking = await this.bookingRepository.save(newBooking);

    if (existVehicle.driver?.user?.id) {
  await this.notificationsService.create({
    userId: existVehicle.driver.user.id,
    message: `You have a new booking request from ${existUser.name}.`,
    type: NotificationType.BOOKINGASSIGNED,
    isRead: false,
  });
}
            return savedBooking;
          }


  async findAll() {
   return await this.bookingRepository.find({relations:['customer','driver','driver.user','vehicle','route','payment','reviews']});
  }

  async findOne(id: string) {
    return await  this.bookingRepository.find({
      where:{id},
        relations:['customer','driver','vehicle','route','payment','reviews']
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    return await this.bookingRepository.update(id,updateBookingDto);
  }

  async remove(id: string) {
    return await  this.bookingRepository.delete(id);
  }

  async updateStatus(id: string, status: BookingStatus) {
  const booking = await this.bookingRepository.findOne({
  where: { id },
  relations: ['customer', 'driver', 'driver.user'],
});

  if (!booking) {
    throw new NotFoundException(`Booking with id ${id} not found`);
  }

  booking.status = status;
   const savedBooking = await this.bookingRepository.save(booking);

   const customerId = booking.customer?.id;
  const driverUserId = booking.driver?.user?.id;

    if (status === 'Accepted') {
    if (customerId) {
      await this.notificationsService.create({
        userId: customerId,
        message: `Your booking Being picked up from ${booking.pickupLocation.address} has been accepted by the driver.`,
        type: NotificationType.BOOKINGCONFIRMATION,
        isRead: false,
      });
    }

  } else if (status === 'Cancelled') {
    // Notify both customer and driver when booking is cancelled
    if (customerId) {
      await this.notificationsService.create({
        userId: customerId,
        message: `Your booking Being picked up from  ${booking.pickupLocation.address} has been cancelled.`,
        type: NotificationType.BOOKINGCONFIRMATION,
        isRead: false,
      });
    }

    if (driverUserId) {
      await this.notificationsService.create({
        userId: driverUserId,
        message: `Booking  from ${booking.pickupLocation.address} has been cancelled by the customer.`,
        type: NotificationType.BOOKINGCONFIRMATION,
        isRead: false,
      });
    }

  } else if (status === 'InProgress') {
    if (customerId) {
      await this.notificationsService.create({
        userId: customerId,
        message: `Your ride from ${booking.pickupLocation.address} is now in progress.`,
        type: NotificationType.DRIVERASSIGNED,
        isRead: false,
      });
    }

  } else if (status === 'Completed') {
    if (customerId) {
      await this.notificationsService.create({
        userId: customerId,
        message: `Your ride to ${booking.dropoffLocation.address} has been completed.`,
        type: NotificationType.RIDECOMPLETED,
        isRead: false,
      });
    }
  }
  return savedBooking;
}

async getSuggestions(searchText: string) {
    if (!searchText || searchText.trim().length < 3) return [];

    const ORS_API_KEY = this.configService.get<string>('ORS_API_KEY');

    const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${encodeURIComponent(searchText)}&boundary.country=KEN`;
    const response = await firstValueFrom(this.httpService.get(url));
    const data = response.data;

    return data.features.map((place: any) => ({
      address: place.properties.label,
      latitude: place.geometry.coordinates[1],
      longitude: place.geometry.coordinates[0],
    }));
  }

async getRouteInfo(pickup: { latitude: number, longitude: number }, dropoff: { latitude: number, longitude: number }) {
    const ORS_API_KEY = this.configService.get<string>('ORS_API_KEY');

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.openrouteservice.org/v2/directions/driving-car',// sends a post request 
          {
            coordinates: [
              [pickup.longitude, pickup.latitude],
              [dropoff.longitude, dropoff.latitude],
            ]
          },
          {
            headers: {
              'Authorization': ORS_API_KEY,
              'Content-Type': 'application/json',
            }
          }
        )
      );

      const summary = response.data.routes[0].summary; 
      const route = response.data.routes[0];

      return {
        distance: +(summary.distance / 1000).toFixed(2), // in kilometers
        estimatedTime: +(summary.duration / 60).toFixed(2),
        geometry: route.geometry,  // in minutes
      };
  
  }
}

