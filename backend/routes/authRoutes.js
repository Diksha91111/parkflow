const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { register, login, verifyOTP, updateProfile, deleteAccount, googleLogin, resendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Use Cloudinary storage so profile pictures persist across Render redeployments
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'parkflow/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/google', googleLogin);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);

// @route DELETE /api/auth/profile
router.delete('/profile', protect, deleteAccount);

module.exports = router;
