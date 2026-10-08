import fs from 'fs';
import path from 'path';

/**
 * Initializes local storage upload folders on server startup.
 * Eliminates AWS S3 dependencies and ensures local uploads work out of the box.
 */
export function ensureUploadDirectories(): void {
  const rootUploads = path.join(process.cwd(), 'uploads');

  const subDirectories = [
    'materials',
    'payments',
    'course-images',
    'blog',
    'temp',
    'public',
  ];

  if (!fs.existsSync(rootUploads)) {
    fs.mkdirSync(rootUploads, { recursive: true });
  }

  for (const dir of subDirectories) {
    const fullPath = path.join(rootUploads, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Local storage directory initialized: uploads/${dir}`);
    }
  }
}
