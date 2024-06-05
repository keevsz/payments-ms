import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { StripeService } from './services/stripe.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly stripeService: StripeService) {}

  // @Post('create-payment-session')
  @MessagePattern('create.payment.session')
  createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
    return this.stripeService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      success: true,
      message: 'Payment successful',
    };
  }

  @Get('cancel')
  cancel() {
    return {
      success: false,
      message: 'Payment cancelled',
    };
  }

  @Post('webhook')
  webhook(@Req() req: Request, @Res() res: Response) {
    return this.stripeService.webhook(req, res);
  }
}
