import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';
import Stripe from 'stripe';
import { PaymentSessionDto } from '../dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class StripeService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId,
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });

    return session;
  }

  async webhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;
    
    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        envs.stripeEndpointSecret,
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object as Stripe.Charge;
        console.log({
          metadata: chargeSucceeded.metadata,
          orderId: chargeSucceeded.metadata.orderId,
        });
        break;
      default:
        console.log(`❌ Unhandled event type ${event.type}`);
        break;
    }
    return res.status(200).json({ sig });
  }
}
