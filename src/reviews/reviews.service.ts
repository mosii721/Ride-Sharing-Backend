import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private  readonly reviewRepository: Repository<Review>,
    @InjectRepository(Booking) private  readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User) private  readonly userRepository: Repository<User>,
    @InjectRepository(Driver) private  readonly driverRepository: Repository<Driver>,
    private  readonly notificationsService: NotificationsService,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const booking = await this.bookingRepository.findOne({
      where: { id: createReviewDto.bookingId },
      relations: ['driver', 'customer','driver.user'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${createReviewDto.bookingId} not found`);
    }

    const reviewer = await this.userRepository.findOneBy({ id: createReviewDto.reviewerId });
    if (!reviewer) {
      throw new NotFoundException(`User with id ${createReviewDto.reviewerId} not found`);
    }

    if (booking.customerId !== createReviewDto.reviewerId) {
      throw new BadRequestException('Reviewer must be the customer who made the booking');
    }

    const newReview = this.reviewRepository.create({
      booking:booking,
      reviewer:reviewer,
      driver:booking.driver,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });

    const savedReview = await this.reviewRepository.save(newReview);

    if (!booking.driver) {
  throw new BadRequestException(`This booking has no driver assigned`);
}

     const allDriverReviews = await this.reviewRepository.find({
    where: { driver: { id: booking.driver.id } },
  });

  const totalRatings = allDriverReviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = totalRatings / allDriverReviews.length;

  booking.driver.rating = parseFloat(avgRating.toFixed(2)); // round to 2 decimal places
  await this.driverRepository.save(booking.driver);

    await this.notificationsService.create({
      userId: booking.driver.user.id,
      message: `You received a new review for booking ${booking.id}: ${createReviewDto.rating}/5`,
      type: NotificationType.RIDECOMPLETED,
      isRead: false,
    });

    return savedReview;
  }

  async findAll() {
    return await this.reviewRepository.find({
      relations: ['booking', 'reviewer', 'driver','driver.user'],
    });
  }

  async findOne(id: string) {
    return await  this.reviewRepository.find({
      where:{id},
        relations:['booking', 'reviewer', 'driver','driver.user']
    });
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    return await this.reviewRepository.update(id,updateReviewDto);
  }

  async remove(id: string) {
    return await  this.reviewRepository.delete(id);
  }
}
