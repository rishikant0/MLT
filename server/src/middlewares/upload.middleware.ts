import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Ensure destination directories exist
const getDestination = (folder: string) => {
  return path.join(process.cwd(), 'uploads', folder);
};

// Custom Storage Engine with sanitized unique filenames
const createStorage = (folder: string) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, getDestination(folder));
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 40);

      cb(null, `${baseName}_${uniqueSuffix}${ext}`);
    },
  });
};

// File Filter for Study Materials (PDF, DOC, DOCX, ZIP, PNG, JPG, JPEG)
const materialFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /pdf|doc|docx|zip|png|jpg|jpeg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype === 'application/x-zip-compressed';

  if (extname || mimetype) {
    return cb(null, true);
  }
  return cb(new Error('Only PDF, Word documents, ZIP, PNG, JPG, and JPEG files are allowed.'));
};

// File Filter for Payment Screenshots & Images (PNG, JPG, JPEG, WEBP)
const imageFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /png|jpg|jpeg|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  return cb(new Error('Only PNG, JPG, JPEG, and WEBP image files are allowed.'));
};

// Export Multer instances
export const uploadMaterial = multer({
  storage: createStorage('materials'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for PDF / Study Notes
  fileFilter: materialFileFilter,
});

export const uploadPaymentScreenshot = multer({
  storage: createStorage('payments'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for Payment Screenshots
  fileFilter: imageFileFilter,
});

export const uploadImage = multer({
  storage: createStorage('course-images'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});
