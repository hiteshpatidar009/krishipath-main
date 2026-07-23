import { Router } from 'express';
import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { authorize } from '../middleware/auth.js';
import { asyncHandler } from '../shared/async-handler.js';
import { AppError } from '../shared/errors.js';
import { ok } from '../shared/response.js';

export const uploadRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 }, fileFilter: (_req, file, cb) => { const allowed = ['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/quicktime']; if (!allowed.includes(file.mimetype)) return cb(new AppError(415, 'Unsupported file type')); cb(null, true); } });
uploadRouter.post('/', authorize('campaigns'), upload.single('file'), asyncHandler(async (req, res) => { if (!req.file) throw new AppError(400, 'A file is required'); if (!env.CLOUDINARY_CLOUD_NAME) throw new AppError(503, 'Cloudinary is not configured', 'UPLOAD_NOT_CONFIGURED'); const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : req.file.mimetype === 'application/pdf' ? 'raw' : 'image'; const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder: `krishipath/${String(req.user!.company)}`, resource_type: resourceType }, (error, value) => error || !value ? reject(error) : resolve(value)); stream.end(req.file!.buffer); }); ok(res, { url: result.secure_url, publicId: result.public_id, mimeType: req.file.mimetype, size: req.file.size }, 'File uploaded', 201); }));
