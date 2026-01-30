// Cloudinary configuration and upload utilities

// Cloudinary configuration (for frontend upload widget)
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset',
};

// Upload image to Cloudinary using base64 or file
export const uploadToCloudinary = async (file, folder = 'seekon-products') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', folder); // Organize uploads in folders

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload avatar to Cloudinary
export const uploadAvatarToCloudinary = async (file) => {
  return uploadToCloudinary(file, 'seekon-avatars');
};

// Upload multiple images
export const uploadMultipleToCloudinary = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch(
      `/api/admin/cloudinary/delete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      }
    );

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Get optimized image URL
export const getOptimizedImageUrl = (url, options = {}) => {
  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  if (!url) return '';
  
  // If already a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    
    if (transformations.length > 0) {
      return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }
  }
  
  return url;
};


