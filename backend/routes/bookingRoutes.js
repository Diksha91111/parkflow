const express = require('express');
const { createOrder, verifyPayment, getMyBookings, getMyMetrics, markOccupied } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-bookings', protect, getMyBookings);
router.get('/my-metrics', protect, getMyMetrics);
router.post('/create', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/:id/occupy', protect, markOccupied);

module.exports = router;
