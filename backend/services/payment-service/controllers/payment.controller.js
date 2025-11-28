const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../../../database/db');

// Strategy pattern for different payment methods
class PaymentStrategy {
    async processPayment(amount, metadata) {
        throw new Error('processPayment must be implemented');
    }
}

class StripePaymentStrategy extends PaymentStrategy {
    async processPayment(amount, metadata) {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return paymentIntent;
    }
}

class PaymentController {
    constructor() {
        // Strategy pattern: Default to Stripe, but can be swapped for other providers
        this.paymentStrategy = new StripePaymentStrategy();
    }

    // Create payment intent
    async createPaymentIntent(req, res) {
        try {
            const { reservationId, amount } = req.body;

            // Verify reservation exists
            const reservationResult = await db.query(
                'SELECT * FROM reservations WHERE id = $1',
                [reservationId]
            );

            if (reservationResult.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Reservation not found' } });
            }

            const reservation = reservationResult.rows[0];

            // Create payment intent using strategy
            const paymentIntent = await this.paymentStrategy.processPayment(amount, {
                reservationId,
                userId: reservation.user_id,
            });

            // Store payment record
            await db.query(
                `INSERT INTO payments (reservation_id, user_id, amount, payment_method, 
                               payment_status, stripe_payment_intent_id)
         VALUES ($1, $2, $3, 'stripe', 'pending', $4)`,
                [reservationId, reservation.user_id, amount, paymentIntent.id]
            );

            res.json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            });
        } catch (error) {
            console.error('Create payment intent error:', error);
            res.status(500).json({ error: { message: 'Failed to create payment intent' } });
        }
    }

    // Get payment by ID
    async getPaymentById(req, res) {
        try {
            const { id } = req.params;

            const result = await db.query(
                `SELECT p.*, r.pickup_date, r.dropoff_date, r.total_amount as reservation_total,
                u.email, u.first_name, u.last_name
         FROM payments p
         JOIN reservations r ON p.reservation_id = r.id
         JOIN users u ON p.user_id = u.id
         WHERE p.id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Payment not found' } });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Get payment error:', error);
            res.status(500).json({ error: { message: 'Failed to get payment' } });
        }
    }

    // Get payments for a reservation
    async getPaymentsByReservation(req, res) {
        try {
            const { reservationId } = req.params;

            const result = await db.query(
                'SELECT * FROM payments WHERE reservation_id = $1 ORDER BY created_at DESC',
                [reservationId]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Get payments error:', error);
            res.status(500).json({ error: { message: 'Failed to get payments' } });
        }
    }

    // Get payments for a user
    async getPaymentsByUser(req, res) {
        try {
            const { userId } = req.params;

            const result = await db.query(
                `SELECT p.*, r.pickup_date, r.dropoff_date
         FROM payments p
         JOIN reservations r ON p.reservation_id = r.id
         WHERE p.user_id = $1
         ORDER BY p.created_at DESC`,
                [userId]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Get user payments error:', error);
            res.status(500).json({ error: { message: 'Failed to get payments' } });
        }
    }

    // Process refund
    async processRefund(req, res) {
        const client = await db.getClient();

        try {
            const { id } = req.params;
            const { amount, reason } = req.body;

            await client.query('BEGIN');

            // Get payment
            const paymentResult = await client.query(
                'SELECT * FROM payments WHERE id = $1 FOR UPDATE',
                [id]
            );

            if (paymentResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: { message: 'Payment not found' } });
            }

            const payment = paymentResult.rows[0];

            if (payment.payment_status !== 'completed') {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: { message: 'Can only refund completed payments' } });
            }

            // Process refund with Stripe
            const refund = await stripe.refunds.create({
                payment_intent: payment.stripe_payment_intent_id,
                amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
                reason: reason || 'requested_by_customer',
            });

            // Update payment record
            await client.query(
                `UPDATE payments 
         SET payment_status = 'refunded', refund_amount = $1, refund_date = CURRENT_TIMESTAMP
         WHERE id = $2`,
                [refund.amount / 100, id]
            );

            await client.query('COMMIT');

            res.json({
                message: 'Refund processed successfully',
                refundId: refund.id,
                amount: refund.amount / 100,
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Process refund error:', error);
            res.status(500).json({ error: { message: 'Failed to process refund' } });
        } finally {
            client.release();
        }
    }

    // Stripe webhook handler
    async handleWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailure(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    }

    // Handle successful payment
    async handlePaymentSuccess(paymentIntent) {
        try {
            const client = await db.getClient();
            await client.query('BEGIN');

            // Update payment status
            const paymentResult = await client.query(
                `UPDATE payments 
         SET payment_status = 'completed', stripe_charge_id = $1
         WHERE stripe_payment_intent_id = $2
         RETURNING reservation_id`,
                [paymentIntent.latest_charge, paymentIntent.id]
            );

            if (paymentResult.rows.length > 0) {
                // Update reservation status to confirmed
                await client.query(
                    'UPDATE reservations SET status = $1 WHERE id = $2',
                    ['confirmed', paymentResult.rows[0].reservation_id]
                );
            }

            await client.query('COMMIT');
            client.release();

            console.log('Payment succeeded:', paymentIntent.id);
        } catch (error) {
            console.error('Handle payment success error:', error);
        }
    }

    // Handle failed payment
    async handlePaymentFailure(paymentIntent) {
        try {
            await db.query(
                `UPDATE payments 
         SET payment_status = 'failed'
         WHERE stripe_payment_intent_id = $1`,
                [paymentIntent.id]
            );

            console.log('Payment failed:', paymentIntent.id);
        } catch (error) {
            console.error('Handle payment failure error:', error);
        }
    }
}

module.exports = new PaymentController();
