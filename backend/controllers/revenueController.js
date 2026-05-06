const User = require('../models/User');

// @desc    Upgrade to Premium
// @route   POST /api/revenue/upgrade
// @access  Private
exports.upgradeToPremium = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // In a real app we would verify Razorpay payment ID here
    // For this demonstration, we assume frontend completed mock payment
    
    // Set expiry to 30 days from now
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    user.isPremium = true;
    user.subscriptionExpiry = expiry;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Successfully upgraded to Premium!',
      data: {
        isPremium: user.isPremium,
        expiry: user.subscriptionExpiry
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Apply to become Partner
// @route   POST /api/revenue/partner
// @access  Private
exports.applyPartner = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'partner') {
      return res.status(400).json({ success: false, message: 'Already a partner' });
    }

    user.role = 'partner';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Successfully registered as a Partner! You can now list parking spots.',
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Revenue Settings Context
// @route   GET /api/revenue/context
// @access  Private
exports.getRevenueContext = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        isPremium: user.isPremium || false,
        expiry: user.subscriptionExpiry || null,
        isPartner: user.role === 'partner',
        commissionRate: 0.10, // 10% defaults
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
