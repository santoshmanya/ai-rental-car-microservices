const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');

// Routes
router.post('/', reservationController.createReservation);
router.get('/', reservationController.getAllReservations);
router.get('/:id', reservationController.getReservationById);
router.patch('/:id/status', reservationController.updateReservationStatus);
router.post('/:id/cancel', reservationController.cancelReservation);

module.exports = router;
