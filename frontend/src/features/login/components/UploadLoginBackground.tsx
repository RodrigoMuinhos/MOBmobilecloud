import React, { useState } from 'react';

const UploadLoginBackground = () => {
  const [preview, setPreview] = useState<string | null>(localStorage.getItem('loginBG'));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        localStorage.setItem('loginBG', base64);
        setPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    localStorage.removeItem('loginBG');
    setPreview(null);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Upload Fundo da Tela de Login</h2>

      {preview && <img src={preview} alt="Preview" className="rounded shadow-md w-full" />}

      <input type="file" accept="image/*" onChange={handleUpload} className="w-full" />

      <button
        onClick={resetImage}
        className="mt-2 text-sm text-red-600 underline"
      >
        Remover imagem de fundo
      </button>
    </div>
  );
};

export default UploadLoginBackground;
