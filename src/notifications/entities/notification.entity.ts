import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";



export  enum NotificationType{
    BOOKINGCONFIRMATION='BookingConfirmation',
    DRIVERASSIGNED='DriverAssigned',
    RIDECOMPLETED='RideCompleted',
    DELIVERYUPDATE = 'DeliveryUpdate',
    BOOKINGASSIGNED='BookingAssigned',
}

@Entity()
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @Column({ type: 'enum', enum: NotificationType,default:NotificationType.BOOKINGCONFIRMATION })
    type: NotificationType;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @Column({type:'timestamp', default:() => 'CURRENT_TIMESTAMP',onUpdate:'CURRENT_TIMESTAMP'})
    updatedAt: Date;

    @ManyToOne(() => User, user => user.notifications)
    @JoinColumn({ name: 'userId' })
    user: Relation<User>

}

 

  

  
