import { Booking } from "src/bookings/entities/booking.entity";
import { Driver } from "src/drivers/entities/driver.entity";
import { Notification } from "src/notifications/entities/notification.entity";
import { Payment } from "src/payments/entities/payment.entity";
import { Review } from "src/reviews/entities/review.entity";
import { Column, Entity,OneToMany,OneToOne,PrimaryGeneratedColumn, Relation} from "typeorm";

export enum Role{
    DRIVER = 'driver',
    ADMIN = 'admin',
    CUSTOMER = 'customer'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    name:string;

    @Column({unique:true})
    email:string;

    @Column()
    password:string;

    @Column({ default: true })
    active: boolean;

    @Column({type:'text', nullable:true,default:null})
    hashedRefreshToken:string | null;

    @Column()
    phone:string;

    @Column({type:'enum',enum:Role,default:Role.CUSTOMER})
    role:Role

    @Column({ nullable: true })
    profilePicture:string;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP'})
    createdAt:Date;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP',onUpdate:'CURRENT_TIMESTAMP'})
    UpdatedAt:Date;

    @OneToOne(() => Driver, driver => driver.user)
    driver: Relation<Driver>;

    @OneToMany(() => Booking, booking => booking.customer)
    bookingsAsCustomer: Booking[];

    @OneToMany(() => Review, review => review.reviewer)
    reviewsGiven: Review[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications: Notification[];

    @OneToMany(() => Payment, payment => payment.user)
    payments: Payment[];

}

