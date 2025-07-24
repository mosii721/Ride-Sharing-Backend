import { Booking } from "src/bookings/entities/booking.entity";
import { Review } from "src/reviews/entities/review.entity";
import { Route } from "src/routes/entities/route.entity";
import { User } from "src/users/entities/user.entity";
import { Vehicle } from "src/vehicles/entities/vehicle.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";


@Entity()
export class Driver {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    userId: string;

    @Column()
    licenseNumber: string;

    @Column({ nullable: true })
    vehicleId: string;

    @Column({ type: 'float', nullable: true })
    rating: number;

    @Column({ type: 'float', nullable: true })
    lastLatitude: number;

    @Column({ type: 'float', nullable: true })
    lastLongitude: number;

    @Column({ type: 'timestamp', nullable: true })
    lastLocationUpdate: Date;

    @Column({ default: true })
    available: boolean;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP',onUpdate:'CURRENT_TIMESTAMP'})
    updatedAt: Date;

    @OneToOne(() => User, user => user.driver)
    @JoinColumn({ name: 'userId' })
    user: Relation<User>;

    
    @OneToOne(() => Vehicle, vehicle => vehicle.driver, { nullable: true })
    @JoinColumn({ name: 'vehicleId' })
    vehicle: Relation<Vehicle>;

    @OneToMany(() => Review, review => review.driver)
    reviews: Review[];

    @OneToMany(() => Booking, booking => booking.driver)
    bookings: Booking[];

    @OneToMany(() => Route, route => route.driver)
        routes: Route[];
}



  
