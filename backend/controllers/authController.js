const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'User already exists and is verified' });
      } else {
        // Option to resend OTP if user exists but not verified (could implement later)
        return res.status(400).json({ success: false, message: 'User exists but not verified. Try logging in to resend OTP.' });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create user
    user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpire,
      isVerified: false
    });

    // Send email
    const message = `
      <h1>Welcome to Smart Parking Finder</h1>
      <p>Please use the following OTP to verify your email address:</p>
      <h2>${otp}</h2>
      <p>This OTP will expire in 5 minutes.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification OTP - Smart Parking Finder',
        html: message,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for OTP.',
        email: user.email,
      });
    } catch (error) {
      console.log('--- NODEMAILER CONFIG ERROR CAUGHT ---');
      console.log('Ensure you have a valid App Password in your .env file!');
      console.log('DEVELOPMENT BYPASS TRIGGERED:');
      console.log(`The OTP code for [${user.email}] is: ${otp}`);
      console.log('--------------------------------------');

      // Do NOT delete the user. Allow them to proceed using the printed OTP.
      res.status(201).json({ 
        success: true, 
        message: 'Email service unavailable. OTP printed to your Node console! (Dev Mode)',
        email: user.email
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Output for debugging
    console.log(`Verifying OTP for ${email}: ${otp}`);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.otpExpire < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    // Send token
    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if verified
    if (!user.isVerified) {
      // Logic to resend OTP could go here
      const otp = generateOTP();
      const otpExpire = new Date(Date.now() + 5 * 60 * 1000);
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();
      
      const message = `
        <h1>Welcome back to Smart Parking Finder</h1>
        <p>Please use the following OTP to verify your email address:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in 5 minutes.</p>
      `;
      
      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification OTP - Smart Parking Finder',
          html: message,
        });
      } catch (error) {
        console.error('Failed to send resend email', error);
      }

      return res.status(401).json({ 
        success: false, 
        message: 'Account not verified. A new OTP has been sent to your email.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Send token
    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.mobile = req.body.mobile || user.mobile;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.gender = req.body.gender || user.gender;
    if (req.body.address !== undefined) {
      user.address = req.body.address;
    }
    if (req.body.vehicleNumber !== undefined) {
      user.vehicleNumber = req.body.vehicleNumber;
    }
    if (req.body.notificationSettings) {
      try {
        const parsed = typeof req.body.notificationSettings === 'string' ? JSON.parse(req.body.notificationSettings) : req.body.notificationSettings;
        user.notificationSettings = { ...user.notificationSettings, ...parsed };
      } catch (err) {}
    }

    if (req.file) {
      user.profilePicture = '/uploads/' + req.file.filename;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        profilePicture: updatedUser.profilePicture,
        address: updatedUser.address,
        vehicleNumber: updatedUser.vehicleNumber,
        notificationSettings: updatedUser.notificationSettings,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/profile
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    const message = `
      <h1>Account Verification</h1>
      <p>Please use the following OTP to verify your email address:</p>
      <h2>${otp}</h2>
      <p>This OTP will expire in 5 minutes.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification OTP - Smart Parking Finder',
        html: message,
      });

      res.status(200).json({
        success: true,
        message: 'A new OTP has been sent to your email.',
      });
    } catch (error) {
      console.log('--- NODEMAILER CONFIG ERROR CAUGHT ---');
      console.log(`The OTP code for [${user.email}] is: ${otp}`);
      res.status(200).json({
        success: true,
        message: 'OTP sent (check Node console if email fails).',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Google OAuth Register/Login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { email, name, profilePicture } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'No email provided from Google' });
    }

    let user = await User.findOne({ email });

    // If User Exists
    if (user) {
      if (user.isVerified) {
        // Direct Login
        return res.status(200).json({
          success: true,
          token: generateToken(user._id),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            profilePicture: user.profilePicture || profilePicture,
            role: user.role
          }
        });
      } else {
        // Exists but unpaid/unverified -> Resend OTP
        const otp = generateOTP();
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000);
        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();

        const message = `<h2>${otp}</h2><p>This OTP will expire in 5 minutes.</p>`;
        try {
          await sendEmail({ email: user.email, subject: 'Email Verification OTP', html: message });
        } catch (error) {
          console.log(`The OTP code for [${user.email}] is: ${otp}`);
        }

        return res.status(401).json({
          success: false,
          message: 'Account not verified. A new OTP has been sent to your email.',
          requiresVerification: true,
          email: user.email
        });
      }
    }

    // New User
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    const generatedPassword = crypto.randomBytes(16).toString('hex'); // Bypass password constraint seamlessly

    user = await User.create({
      name: name || 'Google User',
      email,
      password: generatedPassword,
      otp,
      otpExpire,
      isVerified: false,
      profilePicture: profilePicture || ''
    });

    const message = `<h2>${otp}</h2><p>This OTP will expire in 5 minutes.</p>`;
    try {
      await sendEmail({ email: user.email, subject: 'Email Verification OTP', html: message });
    } catch (error) {
       console.log(`The OTP code for [${user.email}] is: ${otp}`);
    }

    res.status(201).json({
      success: false,
      message: 'Account created. OTP sent to email for verification.',
      requiresVerification: true,
      email: user.email
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
