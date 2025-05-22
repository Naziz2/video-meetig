// utils/profileimg.ts
// Utility to upload profile images to images/p_images with username as public ID

/**
 * Upload a profile image to Cloudinary (or your storage provider) in the folder images/p_images
 * The image will be stored with the username as the public ID.
 * @param file The image file to upload
 * @param username The username to use as the public ID
 * @returns Promise<string> - The secure URL of the uploaded image
 */
export async function uploadProfileImage(file: File, username: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default'); // Default unsigned upload preset
  formData.append('folder', 'images/p_images'); // Folder for profile images
  formData.append('public_id', username); // Use username as public ID
  formData.append('resource_type', 'image');
  formData.append('api_key', '468437437282978'); // Your Cloudinary API key

  // Add timestamp
  const timestamp = Math.round((new Date()).getTime() / 1000);
  formData.append('timestamp', timestamp.toString());

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/dbtnbqmw8/image/upload', true);

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        console.log(`Upload progress: ${percentComplete}%`);
      }
    };

    xhr.onload = function() {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log('Profile image upload successful:', response);
        resolve(response.secure_url);
      } else {
        console.error('Profile image upload failed:', xhr.responseText);
        reject(new Error('Failed to upload profile image'));
      }
    };

    xhr.onerror = function() {
      console.error('Profile image upload error occurred');
      reject(new Error('Network error during profile image upload'));
    };

    xhr.send(formData);
  });
}
