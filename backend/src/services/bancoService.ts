import fs from 'fs';
import path from 'path';

const caminho = path.join(__dirname, '..', 'database', 'banco.json');

export const lerBanco = () => {
  const data = fs.readFileSync(caminho, 'utf-8');
  return JSON.parse(data);
};

export const salvarBanco = (dados: any) => {
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
};
