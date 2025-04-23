import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create storage engine with custom filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create date-based folder structure (YYYY/MM/DD)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const uploadPath = path.join(uploadsDir, String(year), month, day);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const sanitizedName = path.basename(file.originalname, fileExt)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    
    cb(null, `${sanitizedName}_${uniqueId}${fileExt}`);
  }
});

// File filter to only accept certain file types
const fileFilter = (req, file, cb) => {
  // Accept common image and document formats used in printing
  const allowedFileTypes = [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.tiff', '.tif', '.bmp', '.svg',
    // Design files
    '.ai', '.eps', '.psd', '.indd', '.pdf', '.cdr',
    // Documents
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé. Types acceptés: ${allowedFileTypes.join(', ')}`), false);
  }
};

// Set up multer with size limits
const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 10 // Maximum 10 files per upload
  }
});

// Custom error handler for multer
export const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred during file upload
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'Erreur: La taille du fichier dépasse la limite autorisée (50MB).' 
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Erreur: Trop de fichiers téléchargés. Maximum 10 fichiers par requête.' 
      });
    } else {
      return res.status(400).json({ 
        message: `Erreur lors du téléchargement: ${err.message}` 
      });
    }
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({ 
      message: err.message || 'Une erreur est survenue lors du téléchargement des fichiers.' 
    });
  }
  
  // If no error, continue to the next middleware
  next();
};

export { uploadMiddleware };