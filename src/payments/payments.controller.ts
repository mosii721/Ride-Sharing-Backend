import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Header, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards';
import { Request, Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';



@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles(Role.ADMIN,Role.CUSTOMER)
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @ApiQuery({
        required: false,
        description: 'Get all payments'
      })
  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  /////////////////////
  @Roles(Role.ADMIN,Role.DRIVER)
  @Get('driver/:driverId')
  findByDriver(@Param('driverId') driverId: string) {
    return this.paymentsService.findByDriverId(driverId);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }

@Public()
@Post('webhook')
@Header('Content-Type', 'application/json')
async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
  const sig = req.headers['stripe-signature'];

  if (!sig || typeof sig !== 'string') {
    return res.status(400).send('Missing or invalid Stripe signature header.');
  }

  try {
    await this.paymentsService.processStripeWebhook(req['rawBody'], sig);
    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}


  @Post('checkout-session')
  @Roles(Role.CUSTOMER)
async createCheckoutSession(@Req() req: Request, @Body() body: { bookingId: string }) {
   console.log('Received body:', body);
  console.log('User:', req.user); 
  const session = await this.paymentsService.createCheckoutSession(body.bookingId, req.user);
  return { url: session.url };
}

 @Post('pay-mpesa')
@Roles(Role.CUSTOMER)
async payMpesa(@Body() body: { phone: string; bookingId: string }) {
  return await this.paymentsService.payWithMpesa(body.phone, body.bookingId);
}

// payments.controller.ts
@Post('mpesa/callback')
async handleMpesaCallback(@Body() body: any) {
  return this.paymentsService.handleMpesaCallback(body);
}
}


