import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { Analytics } from '@segment/analytics-node'
const analytics = new Analytics({ writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY! });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
  }
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type as Stripe.Event.Type) {
    case 'customer.created':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const customer = event.data.object as Stripe.Customer;
      if (customer.metadata.stripe_customer_id) {
        await clerkClient().users.updateUserMetadata(customer.metadata.stripe_customer_id, {
          privateMetadata: {
            stripe_customer_id: customer.id as string,
          }
        });
      }
      analytics.track(
        {
          userId: customer.metadata.clerk_user_id,
          event: 'Customer Created',
          properties: {
            email: customer.email,
            name: customer.name,
            createdAt: customer.created,
          },
        }
      )
    case 'customer.updated':
      break;
    case 'payment_intent.succeeded':
      console.log('PaymentIntent was successful!');
      // Handle successful payment intent
      break;
    case 'invoice.paid':
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Invoice was paid!');
      // Handle paid invoice
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      console.log('Invoice payment failed!');
      // Handle failed invoice payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
