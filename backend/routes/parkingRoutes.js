const express = require('express');
const { getNearbySpots, searchSpots, getSpotById } = require('../controllers/parkingController');

const router = express.Router();

router.get('/nearby', getNearbySpots);
router.get('/search', searchSpots);
router.get('/:id', getSpotById);

module.exports = router;
