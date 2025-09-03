// src/middlewares/uploadAvatar.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types'; // npm i mime-types

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    // tenta pegar a extensão pelo mimetype (jpg/png/webp), cai para .jpg
    const ext =
      (mime.extension(file.mimetype) && `.${mime.extension(file.mimetype)}`) ||
      path.extname(file.originalname) ||
      '.jpg';
    const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, name);
  },
});

export const uploadAvatar = multer({ storage });
