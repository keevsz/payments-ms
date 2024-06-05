import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { StripeService } from './services/stripe.service';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [PaymentsController],
  providers: [StripeService],
  imports: [NatsModule],
})
export class PaymentsModule {}
