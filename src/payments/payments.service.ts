import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { stripeConfig } from './stripe/config';
import axios from 'axios';


@Injectable()
export class PaymentsService {
  private readonly stripe:Stripe

  constructor(@InjectRepository(Payment) private readonly paymentRepository:Repository<Payment>,
      @InjectRepository(User) private readonly userRepository:Repository<User>,
      @InjectRepository(Booking) private readonly bookingRepository:Repository<Booking>,
      @InjectRepository(Driver) private readonly driverRepository:Repository<Driver>,
      private readonly configService: ConfigService,
    ){
        const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not defined in environment');
      }
      this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-06-30.basil' as any,
    });
    }

  async create(createPaymentDto: CreatePaymentDto) {
    const existUser  = await this.userRepository.findOneBy({id: createPaymentDto.userId});
        
            if(!existUser ){
              throw new NotFoundException(`User   with  id  ${createPaymentDto.userId}  not found`);
            }
    
            let booking: Booking | null = null;
            if (createPaymentDto.bookingId) {
              booking = await this.bookingRepository.findOneBy({ id: createPaymentDto.bookingId });
            if (!booking) {
            throw new NotFoundException(`Booking with id ${createPaymentDto.bookingId} not found`);
}
            if (booking && booking.customerId !== createPaymentDto.userId) {
            throw new BadRequestException('Booking does not belong to this user');

          }
        }
    
            const newPayment = this.paymentRepository.create({
              amount:createPaymentDto.amount,
              method:createPaymentDto.method,
              status: createPaymentDto.status ?? 'Pending',
              transactionId:createPaymentDto.transactionId,
              user:existUser,
              booking:booking ?? undefined,
            })
            return  await this.paymentRepository.save(newPayment)
          }

  async findAll() {
    return await this.paymentRepository.find({relations:['user','booking','booking.driver']});
  }

  async findOne(id: string) {
    return await  this.paymentRepository.find({
      where:{id},
        relations:['user','booking','booking.driver']
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    return await this.paymentRepository.update(id,updatePaymentDto);
  }

  async remove(id: string) {
    return await  this.paymentRepository.delete(id);
  }

 async findByDriverId(driverId: string) {
  const driver = await this.driverRepository.findOne({
    where: { id: driverId },
  });

  if (!driver) {
    throw new NotFoundException(`Driver with id ${driverId} not found`);
  }

  return await this.paymentRepository.find({
    where: {
      booking: {
        driver: { id: driverId }
      }
    },
    relations: ['user', 'booking', 'booking.driver'],
  });
}


  async createCheckoutSession(bookingId: string, user: any) {
     console.log('Finding booking for ID:', bookingId);
  const booking = await this.bookingRepository.findOne({
    where: { id: bookingId },
    relations: ['customer'], 
  });

  if (!booking) {
    console.log('Booking not found');
    throw new NotFoundException(`Booking with id ${bookingId} not found`);
  }

  if (booking.customer.id !== user.sub) { // to ensure the logged in user really own the boooking
     console.log('Booking customer ID:', booking.customer?.id);
      console.log('Authenticated user ID:', user.sub);
    throw new BadRequestException('This booking does not belong to the user.');
  }
  console.log('Creating stripe session for:', booking);

  const YOUR_DOMAIN = this.configService.get('FRONTEND_URL') || 'http://localhost:3000'; // frontend url
try {
  const session =  await this.stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: stripeConfig.currency, 
          product_data: {
            name: `Booking Fare - ${booking.type}`,
          },
          unit_amount: Math.round(Number(booking.fare) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId,
      userId: user.sub,
    },
     success_url: `${YOUR_DOMAIN}/dashboard/customer/payments`,
  cancel_url: `${YOUR_DOMAIN}/dashboard/customer/`,
  });

  return session;
  } catch (error) {
  console.error('Stripe error:', error);
  throw new InternalServerErrorException('Failed to create checkout session');
}
}

handleStripeWebhook(rawBody: Buffer, sig: string): Stripe.Event {
  const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

  if (!webhookSecret) {
    throw new Error('Missing secret in env');
  }

  try {
    const event = this.stripe.webhooks.constructEvent(rawBody, sig, webhookSecret); 
    return event;
  } catch (err) {
    throw new BadRequestException(`Webhook Error: ${err.message}`);
  }
}

async processStripeWebhook(rawBody: Buffer, sig: string): Promise<void> {
   const event = this.handleStripeWebhook(rawBody, sig);

  if (event.type === 'checkout.session.completed') { // runs when payment seesiion is completed
    const session = event.data.object as Stripe.Checkout.Session;

    const transactionId = session.payment_intent as string;
    const amount = session.amount_total! / 100;
    const method = PaymentMethod.STRIPE;
    const userId = session.metadata?.userId;
    const bookingId = session.metadata?.bookingId;

    if (!transactionId || !userId || !bookingId) {
      throw new Error('Missing required metadata from Stripe session.');
    }

    await this.create({
      transactionId,
      amount,
      method,
      status: PaymentStatus.COMPLETED,
      userId,
      bookingId,
    });
  }
}

async payWithMpesa(phone: string, bookingId: string) {
  const booking = await this.bookingRepository.findOne({
    where: { id: bookingId },
    relations: ['customer'],
  });

  if (!booking) {
    throw new NotFoundException(`Booking with ID ${bookingId} not found`);
  }

  const consumerKey = this.configService.get<string>('MPESA_CONSUMER_KEY')!;
  const consumerSecret = this.configService.get<string>('MPESA_CONSUMER_SECRET')!;
  const shortcode = this.configService.get<string>('MPESA_SHORT_CODE')!;
  const passkey = this.configService.get<string>('MPESA_PASSKEY')!;
  const callbackUrl = this.configService.get<string>('MPESA_CALLBACK_URL')!;

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  let accessToken: string;
  try {
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', 
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    accessToken = tokenResponse.data.access_token;// getting acess token from saf
  } catch (err) {
    console.error('Access token error:', err.response?.data || err.message);
    throw new InternalServerErrorException('Failed to get access token');
  }

  const timestamp = new Date().toLocaleString('sv').replace(/[- :]/g, '');
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(Number(booking.fare)),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: `Booking_${bookingId}`,
    TransactionDesc: `Payment for Booking ${bookingId}`,
  };

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',//send an stk push
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error('STK push error:', err.response?.data || err.message);
    throw new InternalServerErrorException('M-Pesa STK Push failed');
  }
}

async handleMpesaCallback(callbackData: any) {
  const result = callbackData.Body.stkCallback; 

  const transactionId = result.CheckoutRequestID;
  const resultCode = result.ResultCode;
  const amount = result.CallbackMetadata?.Item.find(i => i.Name === 'Amount')?.Value;
  const ref = result.CallbackMetadata?.Item.find(i => i.Name === 'AccountReference')?.Value;

  const bookingId = ref.replace('Booking_', ''); // ref removes the Booking_ part from account refrence

  const booking = await this.bookingRepository.findOneBy({ id: bookingId });

  if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

  if (resultCode === 0) { // result is success
    const user = await this.userRepository.findOneBy({ id: booking.customerId });

     if (!user) throw new NotFoundException(`User  not found`);
    const newPayment = this.paymentRepository.create({
      amount,
      method: PaymentMethod.MPESA,
      status: PaymentStatus.COMPLETED,
      transactionId,
      user,
      booking,
    });

    return await this.paymentRepository.save(newPayment);
  } else {
    console.log('M-Pesa Payment failed with code:', resultCode);
    return { message: 'Payment failed or cancelled' };
  }
}


}

