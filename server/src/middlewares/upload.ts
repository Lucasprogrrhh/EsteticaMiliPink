import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use Cloudinary storage so images persist across Render restarts
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req: any, file: Express.Multer.File) => {
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        return {
            folder: 'estetica-portfolio',
            // Use auto format + quality for best compression
            format: ext === 'heic' || ext === 'heif' ? 'jpg' : undefined,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        };
    },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];

    if (file.mimetype.startsWith('image/') || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (.jpg, .jpeg, .png, .webp, .heic)'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // Limite de 20MB
    }
});
