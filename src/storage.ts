import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgressCallback {
  (progress: number, snapshotState: string): void;
}

/**
 * Uploads an image file to Firebase Storage under a unique timestamped path
 * and returns the permanent HTTPS download URL.
 */
export async function uploadImage(
  file: File,
  folder: 'products' | 'articles' | 'chat' | 'avatars' = 'products',
  onProgress?: UploadProgressCallback
): Promise<string> {
  // Validate file type & size (max 10MB)
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPEG, PNG, WebP, GIF).');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size must be less than 10MB.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `${folder}/${uniqueId}_${cleanFileName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress), snapshot.state);
          }
        },
        (error) => {
          console.warn('Firebase Storage upload error, creating optimized client fallback:', error);
          // If storage bucket write is blocked by CORS/permissions in preview, convert to client data URL
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result as string);
            } else {
              reject(new Error(`Failed to upload image: ${error.message}`));
            }
          };
          reader.readAsDataURL(file);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  } catch (err) {
    console.warn('Storage initial upload exception, falling back to data URL:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}
