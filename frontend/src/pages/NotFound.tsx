// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFAFA] text-[#1E6356] px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Página não encontrada</p>
      <Link
        to="/"
        className="px-6 py-2 bg-[#A1D9C1] text-white rounded-md shadow-md hover:bg-[#87cbb0] transition"
      >
        Voltar ao Início
      </Link>
    </div>
  );
};

export default NotFound;