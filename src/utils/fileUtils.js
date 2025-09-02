/**
 * Determines if a file is an image based on its MIME type
 * @param {File} file - The file to check
 * @returns {boolean} - True if the file is an image, false otherwise
 */
export const isImageFile = (file) => {
  return file.type.startsWith('image/');
};

/**
 * Gets the appropriate Cloudinary upload endpoint based on file type
 * @param {File} file - The file to upload
 * @param {string} cloudName - Your Cloudinary cloud name
 * @returns {string} - The appropriate upload URL
 */
export const getCloudinaryUploadUrl = (file, cloudName) => {
  const baseUrl = `https://api.cloudinary.com/v1_1/${cloudName}`;
  return isImageFile(file) 
    ? `${baseUrl}/image/upload`
    : `${baseUrl}/raw/upload`;
};

/**
 * Validates if a file is supported for upload
 * @param {File} file - The file to validate
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export const validateFile = (file) => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 10MB limit' };
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Unsupported file type. Please upload an image or PDF file.' 
    };
  }

  return { isValid: true };
}; 