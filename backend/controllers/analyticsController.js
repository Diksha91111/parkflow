const Booking = require('../models/Booking');

// @desc    Get daily booking counts
// @route   GET /api/admin/analytics/daily-bookings
// @access  Private/Admin
exports.getDailyBookings = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          booking_status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('GetDailyBookings Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get revenue over time
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
exports.getRevenue = async (req, res) => {
  try {
    const period = req.query.period || 'daily'; // 'daily', 'weekly', 'monthly'
    let days = 30;
    let format = '%Y-%m-%d';

    if (period === 'weekly') {
      days = 90; // Last 3 months for weekly
      format = '%Y-%U'; // Year-week
    } else if (period === 'monthly') {
      days = 365; // Last year for monthly
      format = '%Y-%m'; // Year-month
    } else {
      days = parseInt(req.query.days) || 30; // Daily default
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          payment_status: 'Completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: format, date: '$createdAt' } },
          revenue: { $sum: '$amount_paid' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', revenue: 1, _id: 0 } },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('GetRevenue Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get peak hours data
// @route   GET /api/admin/analytics/peak-hours
// @access  Private/Admin
exports.getPeakHours = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $match: {
          booking_status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: { $hour: '$start_time' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { hour: '$_id', count: 1, _id: 0 } },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('GetPeakHours Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get top booked spots
// @route   GET /api/admin/analytics/top-spots
// @access  Private/Admin
exports.getTopSpots = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $match: { booking_status: { $ne: 'cancelled' }, parkingSlotId: { $ne: null } } },
      { $group: { _id: '$parkingSlotId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'parkingslots',
          localField: '_id',
          foreignField: '_id',
          as: 'spotDetails'
        }
      },
      { $unwind: '$spotDetails' },
      { $project: { name: '$spotDetails.name', count: 1, _id: 0 } }
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('GetTopSpots Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get booking status breakdown
// @route   GET /api/admin/analytics/status-breakdown
// @access  Private/Admin
exports.getStatusBreakdown = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $group: { _id: '$booking_status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('GetStatusBreakdown Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

