// backend/src/types/express-file.d.ts
export {};

declare global {
  namespace Express {
    interface Request {
      file?: any;
      files?: any;
    }
  }
}
