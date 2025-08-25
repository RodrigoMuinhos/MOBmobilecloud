import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'avatars');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const cpf = (req.params as any)?.cpf || 'usuario';
    const ext = path.extname(file.originalname);
    cb(null, `${cpf}-${Date.now()}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Apenas imagens são permitidas.'));
};

export default multer({ storage, fileFilter });
