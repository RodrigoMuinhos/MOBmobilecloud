// backend/src/middlewares/upload.ts
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import type { RequestHandler } from 'express';

const AVATAR_DIR = path.resolve(__dirname, '..', '..', 'uploads', 'avatars');
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, AVATAR_DIR);
  },
  filename(_req, file, cb) {
    const orig = file?.originalname ?? 'file';
    const ext = path.extname(orig).toLowerCase();
    const base = path.basename(orig, ext).replace(/\s+/g, '-');
    cb(null, `${base}-${Date.now()}${ext || '.png'}`);
  },
});

// Assinatura correta do fileFilter, sem usar Express.Multer.*
const fileFilter: NonNullable<import('multer').Options['fileFilter']> = (
  _req,
  file,
  cb
) => {
  if (/^image\/(png|jpe?g|webp)$/i.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Use PNG, JPG, JPEG ou WEBP.'));
  }
};

const limits: NonNullable<import('multer').Options['limits']> = {
  fileSize: 5 * 1024 * 1024,
};

const upload = multer({ storage, fileFilter, limits });

// Exporte o **handler** (RequestHandler), não a instância do Multer
export const uploadAvatarSingle: RequestHandler = (req, res, next) =>
  upload.single('avatar')(req, res, next);

export default uploadAvatarSingle;
