import { Booking } from "src/bookings/entities/booking.entity";
import { Driver } from "src/drivers/entities/driver.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

export  enum VehicleStatus{
    AVAILABLE='Available',
    INUSE='InUse',
    MAINTENANCE='Maintenance',
}

export  enum VehicleType{
    SEDAN='Sedan',
    SUV='SUV',
    VAN='Van',
    BIKE = 'Bike',
}


@Entity()
export class Vehicle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    licensePlate: string;

    @Column()
    model: string;

    @Column()
    capacity: number;

    @Column({type:'enum',enum:VehicleType,default:VehicleType.SEDAN})
    type:VehicleType;

    @Column({type:'enum',enum:VehicleStatus,default:VehicleStatus.AVAILABLE})
    status:VehicleStatus;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP'})
    createdAt: Date;
        
    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP',onUpdate:'CURRENT_TIMESTAMP'})
    updatedAt: Date;

    @OneToOne(() => Driver, driver => driver.vehicle)
    driver: Relation<Driver>;

    @OneToMany(() => Booking, booking => booking.vehicle)
    bookings: Booking[];
}



