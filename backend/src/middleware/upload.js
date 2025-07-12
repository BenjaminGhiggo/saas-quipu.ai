import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'invoices');
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.xls', '.xlsx'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, PDF, XLS, XLSX'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Tamaño máximo: 10MB',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Máximo: 5 archivos',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Error de carga: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  next(error);
};

// File processing utilities
const processUploadedFile = async (file) => {
  try {
    const stats = await fs.stat(file.path);
    
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: stats.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Error processing file: ${error.message}`);
  }
};

// Clean up old files
const cleanupOldFiles = async (directory, maxAge = 7 * 24 * 60 * 60 * 1000) => {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
};

// Schedule cleanup every 24 hours
setInterval(() => {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'invoices');
  cleanupOldFiles(uploadsDir);
}, 24 * 60 * 60 * 1000);

export {
  upload,
  handleUploadError,
  processUploadedFile,
  cleanupOldFiles
};