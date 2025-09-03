// src/server.ts
import app from './app';

const PORT = Number(process.env.PORT) || 3333;
const HOST = '0.0.0.0'; // garante acesso pelo IP local e pelo localhost

app.listen(PORT, HOST, () => {
  console.log(`🚀 API ouvindo em http://${HOST}:${PORT}`);
});

// captura erros não tratados para debug
process.on('unhandledRejection', (err) => console.error('UnhandledRejection:', err));
process.on('uncaughtException', (err) => console.error('UncaughtException:', err));
