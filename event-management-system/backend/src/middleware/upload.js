const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

// Configure Cloudinary storage
const createCloudinaryStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto:good',
          format: 'jpg'
        }
      ]
    }
  });
};

// Storage for event posters
const eventPosterStorage = createCloudinaryStorage('kongu-events/posters');

// Storage for payment QR codes
const paymentQRStorage = createCloudinaryStorage('kongu-events/payment-qr');

// Storage for payment screenshots
const paymentScreenshotStorage = createCloudinaryStorage('kongu-events/payment-screenshots');

// Storage for profile images
const profileImageStorage = createCloudinaryStorage('kongu-events/profiles');

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instances for different upload types
const uploadEventPoster = multer({
  storage: eventPosterStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

const uploadPaymentQR = multer({
  storage: paymentQRStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  }
});

const uploadPaymentScreenshot = multer({
  storage: paymentScreenshotStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit
  }
});

const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  }
});

// Multiple file upload for events (poster + payment QR)
const uploadEventFiles = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 2
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Please upload a smaller image.'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum allowed is 2.'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  } else if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!'
    });
  }
  
  console.error('Upload error:', error);
  return res.status(500).json({
    success: false,
    message: 'File upload error'
  });
};

module.exports = {
  uploadEventPoster,
  uploadPaymentQR,
  uploadPaymentScreenshot,
  uploadProfileImage,
  uploadEventFiles,
  handleUploadError
};
