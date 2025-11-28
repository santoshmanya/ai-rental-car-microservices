const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Payment routes
router.post('/create-intent', paymentController.createPaymentIntent.bind(paymentController));
router.get('/:id', paymentController.getPaymentById.bind(paymentController));
router.get('/reservation/:reservationId', paymentController.getPaymentsByReservation.bind(paymentController));
router.get('/user/:userId', paymentController.getPaymentsByUser.bind(paymentController));
router.post('/:id/refund', paymentController.processRefund.bind(paymentController));

// Stripe webhook
router.post('/webhook', paymentController.handleWebhook.bind(paymentController));

module.exports = router;
