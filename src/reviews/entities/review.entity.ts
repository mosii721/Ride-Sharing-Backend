import { Booking } from "src/bookings/entities/booking.entity";
import { Driver } from "src/drivers/entities/driver.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity()
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    bookingId: string;

    @Column()
    reviewerId: string;

    @Column({ nullable: true })
    driverId: string;

    @Column('float')
    rating: number;

    @Column({ nullable: true })
    comment: string;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP',onUpdate:'CURRENT_TIMESTAMP'})
    updatedAt: Date;

    @ManyToOne(() => Booking, booking => booking.reviews)
    @JoinColumn({ name: 'bookingId' })
    booking: Relation<Booking>;

    @ManyToOne(() => User, user => user.reviewsGiven)
    @JoinColumn({ name: 'reviewerId' })
    reviewer: Relation<User>;

    @ManyToOne(() => Driver, driver => driver.reviews,{ nullable: true })
    @JoinColumn({ name: 'driverId' })
    driver: Relation<Driver>;
}


  

  