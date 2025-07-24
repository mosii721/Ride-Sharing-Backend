import { Driver } from "src/drivers/entities/driver.entity";
import { Payment } from "src/payments/entities/payment.entity";
import { Review } from "src/reviews/entities/review.entity";
import { Route } from "src/routes/entities/route.entity";
import { User } from "src/users/entities/user.entity";
import { Vehicle } from "src/vehicles/entities/vehicle.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

export  enum BookingType{
    CARPOOL='Carpool',
    DELIVERY='Delivery',
    PRIVATERIDE='PrivateRide',
}

export  enum BookingStatus{
    PENDING='Pending',
    ACCEPTED='Accepted',
    INPROGRESS='InProgress',
    COMPLETED='Completed',
    CANCELLED='Cancelled',
}


@Entity()
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    customerId: string;

    @Column({ nullable: true })
    driverId: string;

    @Column()
    vehicleId: string;

    @Column({ nullable: true })
    routeId: string;

    @Column({ type: 'enum', enum:BookingType,default:BookingType.PRIVATERIDE })
    type: BookingType;

    @Column('json')
    pickupLocation: { latitude: number; longitude: number; address: string };

    @Column('json')
    dropoffLocation: { latitude: number; longitude: number; address: string };

    @Column({ type: 'enum', enum: BookingStatus,default:BookingStatus.PENDING })
    status: BookingStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    fare: number;

    @Column('float', { nullable: true })
    distance: number;

    @Column('float',{ nullable: true })
    estimatedTime: number;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP',onUpdate:'CURRENT_TIMESTAMP'})
    updatedAt: Date;

    @ManyToOne(() => User, user => user.bookingsAsCustomer)
    @JoinColumn({ name: 'customerId' })
    customer: Relation<User>;

    @ManyToOne(() => Driver, driver=> driver.bookings, { nullable: true })
    @JoinColumn({ name: 'driverId' })
    driver: Relation<Driver>;

    @ManyToOne(() => Vehicle, vehicle => vehicle.bookings)
    @JoinColumn({ name: 'vehicleId' })
    vehicle: Relation<Vehicle>;

    @ManyToOne(() => Route, route => route.bookings, { nullable: true })
    @JoinColumn({ name: 'routeId' })
    route: Relation<Route>;

    @OneToOne(() => Payment, payment => payment.booking)
    payment: Relation<Payment>;

    @OneToMany(() => Review, review => review.booking)
    reviews: Review[];
}


  