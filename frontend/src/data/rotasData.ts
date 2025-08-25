export const distanciasEntreCidades: {
  [origem: string]: {
    [destino: string]: {
      distancia: number;
      tempo: number; // tempo em minutos
    };
  };
} = {
  'BaseMóvel': {
    'Caucaia': { distancia: 18, tempo: 25 },
    'Maranguape': { distancia: 27, tempo: 32 },
    'Pacatuba': { distancia: 30, tempo: 36 },
    'Eusébio': { distancia: 24, tempo: 28 },
    'Aquiraz': { distancia: 32, tempo: 40 },
    'Horizonte': { distancia: 42, tempo: 50 },
    'Itaitinga': { distancia: 28, tempo: 34 },
    'São Gonçalo do Amarante': { distancia: 60, tempo: 75 },
    'Chorozinho': { distancia: 69, tempo: 90 },
    'Cascavel': { distancia: 65, tempo: 85 },
    'Paraipaba': { distancia: 93, tempo: 110 },
    'Pentecoste': { distancia: 88, tempo: 105 },
    'Guaiúba': { distancia: 47, tempo: 55 },
    'Pacajus': { distancia: 48, tempo: 60 },
    'Redenção': { distancia: 62, tempo: 75 },
  },
  'Caucaia': {
    'Maranguape': { distancia: 24, tempo: 30 },
    'BaseMóvel': { distancia: 18, tempo: 25 },
  },
  'Maranguape': {
    'Pacatuba': { distancia: 8, tempo: 12 },
    'BaseMóvel': { distancia: 27, tempo: 32 },
  },
  'Pacatuba': {
    'Eusébio': { distancia: 19, tempo: 22 },
    'BaseMóvel': { distancia: 30, tempo: 36 },
  },
  'Eusébio': {
    'Aquiraz': { distancia: 10, tempo: 14 },
    'BaseMóvel': { distancia: 24, tempo: 28 },
  },
  'Aquiraz': {
    'Horizonte': { distancia: 20, tempo: 26 },
    'BaseMóvel': { distancia: 32, tempo: 40 },
  },
  'Horizonte': {
    'Itaitinga': { distancia: 15, tempo: 20 },
    'BaseMóvel': { distancia: 42, tempo: 50 },
  },
  'Itaitinga': {
    'São Gonçalo do Amarante': { distancia: 50, tempo: 60 },
    'BaseMóvel': { distancia: 28, tempo: 34 },
  },
  'São Gonçalo do Amarante': {
    'Chorozinho': { distancia: 45, tempo: 55 },
    'BaseMóvel': { distancia: 60, tempo: 75 },
  },
  'Chorozinho': {
    'Cascavel': { distancia: 30, tempo: 38 },
    'BaseMóvel': { distancia: 69, tempo: 90 },
  },
  'Cascavel': {
    'Paraipaba': { distancia: 35, tempo: 45 },
    'BaseMóvel': { distancia: 65, tempo: 85 },
  },
  'Paraipaba': {
    'Pentecoste': { distancia: 55, tempo: 70 },
    'BaseMóvel': { distancia: 93, tempo: 110 },
  },
  'Pentecoste': {
    'Guaiúba': { distancia: 40, tempo: 50 },
    'BaseMóvel': { distancia: 88, tempo: 105 },
  },
  'Guaiúba': {
    'Pacajus': { distancia: 22, tempo: 30 },
    'BaseMóvel': { distancia: 47, tempo: 55 },
  },
  'Pacajus': {
    'Redenção': { distancia: 27, tempo: 36 },
    'BaseMóvel': { distancia: 48, tempo: 60 },
  },
  'Redenção': {
    'BaseMóvel': { distancia: 62, tempo: 75 },
  }
};