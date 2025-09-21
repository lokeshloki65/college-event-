const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to cloudinary
const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      quality: 'auto:good',
      format: 'jpg',
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format
          });
        }
      }
    ).end(buffer);
  });
};

// Delete image from cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Upload multiple images
const uploadMultipleToCloudinary = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file.buffer, {
        ...options,
        folder: options.folder || 'kongu-events'
      })
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary
};
