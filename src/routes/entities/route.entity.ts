import { Booking } from "src/bookings/entities/booking.entity";
import { Driver } from "src/drivers/entities/driver.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";

export  enum RouteStatus{
    OPEN='Open',
    CLOSED='Closed',
    CANCELLED='Cancelled',
}

@Entity()
export class Route {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    driverId: string;

    @Column('json')
    startLocation: { latitude: number; longitude: number; address: string };
    
    @Column('json')
    endLocation: { latitude: number; longitude: number; address: string };

    @Column()
    availableSeats: number;

    @Column({ type: 'time' })
    departureTime: string;

    @Column({type:'enum',enum:RouteStatus,default:RouteStatus.OPEN})
    status: RouteStatus;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP'})
    createdAt: Date;
    
    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP',onUpdate:'CURRENT_TIMESTAMP'})
    updatedAt: Date;

    @ManyToOne(() => Driver, driver => driver.routes)
    @JoinColumn({ name: 'driverId' })
    driver: Relation<Driver>;

    @OneToMany(() => Booking, booking => booking.route)
    bookings: Booking[];
}





