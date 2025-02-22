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
    break
    case 'customer.updated':
      break;
    case 'payment_intent.succeeded':
      console.log('PaymentIntent was successful!');
      // Handle successful payment intent
      break;
    case 'invoice.paid':
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Invoice was paid!');
      analytics.track(
        {
          userId: invoice.id,
          event: 'Invoice Paid',
          properties: {
            amount: invoice.amount_due,
            currency: invoice.currency,
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            invoiceDate: invoice.due_date,
            customerEmail: invoice.customer_email,
            customerName: invoice.customer_name,
            customerId: invoice.customer,
          },
        }
      )
      // Handle paid invoice
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      analytics.track(
        {
          userId: failedInvoice.id,
          event: 'Invoice Payment Failed',
          properties: {
            amount: failedInvoice.amount_due,
            currency: failedInvoice.currency,
            invoiceId: failedInvoice.id,
            invoiceNumber: failedInvoice.number,
            invoiceDate: failedInvoice.due_date,
            customerEmail: failedInvoice.customer_email,
            customerName: failedInvoice.customer_name,
            customerId: failedInvoice.customer,
          },
        }
      )
      console.log('Invoice payment failed!');
      // Handle failed invoice payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}