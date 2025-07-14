const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, S3_CONFIG, DB_CONFIG } = require('../config/aws-v3');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

class S3Service {
  constructor() {
    this.bucketName = S3_CONFIG.BUCKET_NAME;
    this.region = S3_CONFIG.REGION;
  }

  // Check if using S3 or local storage
  isUsingS3() {
    return process.env.STORAGE_TYPE === 's3';
  }

  // Generate unique file name
  generateFileName(originalName, userId, prefix = '') {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    return `${prefix}${userId}_${timestamp}_${randomString}${extension}`;
  }

  // Generate S3 key (path) for file
  generateS3Key(fileName, folder = 'uploads') {
    return `${folder}/${fileName}`;
  }

  // Upload file to S3
  async uploadFile(file, userId, options = {}) {
    try {
      if (!this.isUsingS3()) {
        // Fall back to local storage
        return await this.uploadFileLocally(file, userId, options);
      }

      const {
        folder = 'profiles',
        prefix = '',
        contentType = file.mimetype || 'application/octet-stream',
        makePublic = true
      } = options;

      // Generate unique filename
      const fileName = this.generateFileName(file.originalname, userId, prefix);
      const s3Key = this.generateS3Key(fileName, folder);

      // Prepare upload parameters
      const uploadParams = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: contentType,
        Metadata: {
          userId: userId,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      };

      // Make file public if requested
      if (makePublic) {
        uploadParams.ACL = 'public-read';
      }

      // Upload to S3
      const command = new PutObjectCommand(uploadParams);
      const result = await s3Client.send(command);

      // Generate public URL
      const fileUrl = this.getPublicUrl(s3Key);

      console.log(`✅ File uploaded to S3: ${s3Key}`);

      return {
        success: true,
        fileName,
        s3Key,
        url: fileUrl,
        bucket: this.bucketName,
        size: file.size,
        contentType,
        etag: result.ETag
      };

    } catch (error) {
      console.error('❌ S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  // Upload file locally (fallback)
  async uploadFileLocally(file, userId, options = {}) {
    try {
      const { folder = 'profiles', prefix = '' } = options;
      
      // Generate unique filename
      const fileName = this.generateFileName(file.originalname, userId, prefix);
      
      // Create local upload path
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      
      // Write file to local storage
      await fs.writeFile(filePath, file.buffer);
      
      // Generate local URL
      const fileUrl = `http://localhost:${process.env.PORT || 3000}/uploads/${folder}/${fileName}`;
      
      console.log(`✅ File uploaded locally: ${filePath}`);
      
      return {
        success: true,
        fileName,
        path: filePath,
        url: fileUrl,
        size: file.size,
        contentType: file.mimetype,
        isLocal: true
      };

    } catch (error) {
      console.error('❌ Local upload error:', error);
      throw new Error(`Failed to upload file locally: ${error.message}`);
    }
  }

  // Get public URL for S3 object
  getPublicUrl(s3Key) {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;
  }

  // Generate pre-signed URL for private access
  async getSignedUrl(s3Key, expiresIn = 3600) {
    try {
      if (!this.isUsingS3()) {
        throw new Error('Signed URLs only available for S3 storage');
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return signedUrl;

    } catch (error) {
      console.error('❌ Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  // Delete file from S3
  async deleteFile(s3Key) {
    try {
      if (!this.isUsingS3()) {
        // Fall back to local deletion
        return await this.deleteFileLocally(s3Key);
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });

      await s3Client.send(command);
      console.log(`✅ File deleted from S3: ${s3Key}`);
      
      return { success: true, s3Key };

    } catch (error) {
      console.error('❌ S3 deletion error:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  // Delete file locally (fallback)
  async deleteFileLocally(filePath) {
    try {
      // If filePath is a URL, extract the local path
      if (filePath.startsWith('http://localhost')) {
        const urlPath = new URL(filePath).pathname;
        filePath = path.join(process.cwd(), urlPath);
      }

      await fs.unlink(filePath);
      console.log(`✅ File deleted locally: ${filePath}`);
      
      return { success: true, path: filePath };

    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`ℹ️  File not found (already deleted): ${filePath}`);
        return { success: true, path: filePath, message: 'File not found' };
      }
      console.error('❌ Local deletion error:', error);
      throw new Error(`Failed to delete local file: ${error.message}`);
    }
  }

  // Check if file exists
  async fileExists(s3Key) {
    try {
      if (!this.isUsingS3()) {
        // Check local file existence
        const filePath = path.join(process.cwd(), 'uploads', s3Key);
        try {
          await fs.access(filePath);
          return true;
        } catch {
          return false;
        }
      }

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });

      await s3Client.send(command);
      return true;

    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(s3Key) {
    try {
      if (!this.isUsingS3()) {
        throw new Error('Metadata only available for S3 storage');
      }

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });

      const result = await s3Client.send(command);
      
      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata
      };

    } catch (error) {
      console.error('❌ Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  // Upload profile photo (specialized method)
  async uploadProfilePhoto(file, userId) {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 5MB.');
      }

      // Upload with profile-specific options
      const result = await this.uploadFile(file, userId, {
        folder: 'profiles',
        prefix: 'profile_',
        contentType: file.mimetype,
        makePublic: true
      });

      return result;

    } catch (error) {
      console.error('❌ Profile photo upload error:', error);
      throw error;
    }
  }

  // Delete profile photo and update user record
  async deleteProfilePhoto(userId, currentPhotoUrl) {
    try {
      if (!currentPhotoUrl) {
        return { success: true, message: 'No photo to delete' };
      }

      if (this.isUsingS3()) {
        // Extract S3 key from URL
        const s3Key = this.extractS3KeyFromUrl(currentPhotoUrl);
        if (s3Key) {
          await this.deleteFile(s3Key);
        }
      } else {
        // Delete local file
        await this.deleteFileLocally(currentPhotoUrl);
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Profile photo deletion error:', error);
      throw error;
    }
  }

  // Extract S3 key from URL
  extractS3KeyFromUrl(url) {
    try {
      if (url.includes(this.bucketName)) {
        // Extract key from S3 URL
        const parts = url.split(`${this.bucketName}.s3.${this.region}.amazonaws.com/`);
        return parts[1] || null;
      }
      return null;
    } catch (error) {
      console.error('❌ Error extracting S3 key from URL:', error);
      return null;
    }
  }

  // Get storage configuration info
  getStorageInfo() {
    return {
      type: this.isUsingS3() ? 's3' : 'local',
      bucket: this.isUsingS3() ? this.bucketName : null,
      region: this.isUsingS3() ? this.region : null,
      localPath: !this.isUsingS3() ? path.join(process.cwd(), 'uploads') : null
    };
  }
}

module.exports = new S3Service(); 