const express = require('express');
const { upgradeToPremium, applyPartner, getRevenueContext } = require('../controllers/revenueController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All revenue routes require auth

router.get('/context', getRevenueContext);
router.post('/upgrade', upgradeToPremium);
router.post('/partner', applyPartner);

module.exports = router;
