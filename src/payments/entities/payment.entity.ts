import { Booking } from "src/bookings/entities/booking.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";


export  enum PaymentStatus{
    PENDING='Pending' ,
    COMPLETED='Completed',
    FAILED='Failed',
}

export  enum PaymentMethod{
    MPESA = 'Mpesa',
    STRIPE = 'Stripe',
    CASH = 'Cash',
}


@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({ nullable: true })
    bookingId: string;

    @Column('decimal')
    amount: number;

    @Column()
    transactionId: string;

    @Column({type:'enum',enum:PaymentMethod,default:PaymentMethod.CASH})
    method: PaymentMethod;

    @Column({type:'enum',enum:PaymentStatus,default:PaymentStatus.PENDING})
    status: PaymentStatus;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP',onUpdate:'CURRENT_TIMESTAMP'})
    updatedAt: Date;

    @ManyToOne(() => User, user => user.payments)
    @JoinColumn({ name: 'userId' })
    user: Relation<User>;

    @OneToOne(() => Booking, booking => booking.payment, { nullable: true })
    @JoinColumn({ name: 'bookingId' })
    booking: Relation<Booking>;

}




  

  

  