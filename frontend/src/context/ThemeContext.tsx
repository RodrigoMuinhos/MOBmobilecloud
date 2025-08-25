import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type Tema = {
  fundo: string;
  fundoAlt: string;
  card: string;
  texto: string;
  textoBranco: string;
  destaque: string;
  contraste: string;
  input: string;
  textoClaro: string;
  textoEscuro: string;
  cardGradient?: string;
  cardHover: string;
  botao: string;
  botaoTexto: string;
};


// ✅ Agora exportado para uso externo (ex: em ThemeSelector)
export const temas: { [key: string]: Tema } = {
  // 🌒 Tema Escuro
  dark: {
    fundo: '#0b0e1c',
    fundoAlt: '#141a2e',
    card: '#1a2238',
    texto: '#eaeef9',
    textoBranco: '#ffffff',
    destaque: '#f97316',
    contraste: '#ffb347',
    input: '#243049',
    textoClaro: '#ffffff',
    textoEscuro: '#0b0e1c',
    cardGradient: 'linear-gradient(145deg, #1a2238, #141a2e)',
    cardHover: '#2c3350',
    botao: '#3b82f6',         // azul vívido
    botaoTexto: '#ffffff',    // texto branco
  },

  // ☀️ Tema Clássico
  classic: {
    fundo: '#f9fafb',
    fundoAlt: '#e5e7eb',
    card: '#ffffff',
    texto: '#1f2937',
    textoBranco: '#ffffff',
    destaque: '#6b8e23',
    contraste: '#a3b18a',
    input: '#e0e7ef',
    textoClaro: '#ffffff',
    textoEscuro: '#1f2937',
    cardGradient: 'linear-gradient(145deg, #ffffff, #e5e7eb)',
    cardHover: '#d1d5db',
    botao: '#2563eb',         // azul Tailwind padrão
    botaoTexto: '#ffffff',
  },

  // 💻 Tema Cyberpunk
  cyber: {
    fundo: '#150a0a',
    fundoAlt: '#241010',
    card: '#2b1212',
    texto: '#ffe4e4',
    textoBranco: '#ffffff',
    destaque: '#ff6b00',
    contraste: '#ff69b4',
    input: '#3d1a1a',
    textoClaro: '#ffffff',
    textoEscuro: '#1e1e1e',
    cardGradient: 'linear-gradient(145deg, #2b1212, #3d1a1a)',
    cardHover: '#552222',
    botao: '#ff6b00',         // laranja cyber
    botaoTexto: '#fff0e5',    // tom creme claro
  },
};


// Tipos disponíveis de temas
export type TemaNome = keyof typeof temas;

// Tipo do contexto
type ThemeContextType = {
  temaAtual: Tema;
  temaSelecionado: TemaNome;
  setTemaSelecionado: (tema: TemaNome) => void;
};

// Contexto
const ThemeContext = createContext<ThemeContextType>({
  temaAtual: temas.dark,
  temaSelecionado: 'dark',
  setTemaSelecionado: () => {},
});

// Provider do contexto
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [temaSelecionado, setTema] = useState<TemaNome>('dark');

  // Carrega do localStorage ao iniciar
  useEffect(() => {
    const salvo = localStorage.getItem('TEMA_USUARIO') as TemaNome;
    if (salvo && temas[salvo]) {
      setTema(salvo);
    }
  }, []);

  // Atualiza tema e persiste no localStorage
  const setTemaSelecionado = (tema: TemaNome) => {
    setTema(tema);
    localStorage.setItem('TEMA_USUARIO', String(tema));
  };

  const temaAtual = temas[temaSelecionado];

  return (
    <ThemeContext.Provider
      value={{ temaAtual, temaSelecionado, setTemaSelecionado }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para consumir o contexto
export const useTheme = () => useContext(ThemeContext);
