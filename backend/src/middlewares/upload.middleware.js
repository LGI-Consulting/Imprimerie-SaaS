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
    '.doc', '.docx', '.txt', '.rtf'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5 // Maximum 5 files
  }
});

// Middleware to parse multipart/form-data
export const parseMultipartForm = (req, res, next) => {
  // Parse JSON fields from the form data
  if (req.body.clientInfo) {
    try {
      req.body.clientInfo = JSON.parse(req.body.clientInfo);
    } catch (error) {
      return res.status(400).json({ message: "Format de données client invalide" });
    }
  }

  if (req.body.options) {
    try {
      req.body.options = JSON.parse(req.body.options);
    } catch (error) {
      return res.status(400).json({ message: "Format d'options invalide" });
    }
  }

  next();
};

// Error handling middleware
export const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux (max 10MB)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Trop de fichiers (max 5)' });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

export default upload;