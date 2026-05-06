const express = require('express');
const { getDemandPrediction, getBestSpot } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/demand', protect, getDemandPrediction);
router.get('/best-spot', protect, getBestSpot);

module.exports = router;
