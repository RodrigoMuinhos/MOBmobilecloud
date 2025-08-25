import React, { useState } from 'react';

const LoginBackgroundUploader: React.FC = () => {
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
    <div className="space-y-4">
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="rounded shadow-md max-w-full max-h-60 object-cover"
        />
      )}

      <label className="block w-full">
        <span className="text-sm font-medium text-gray-700">Escolher imagem de fundo</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:bg-orange-500 file:text-white hover:file:bg-orange-600"
        />
      </label>

      {preview && (
        <button
          onClick={resetImage}
          className="text-red-600 text-sm underline"
        >
          Remover imagem atual
        </button>
      )}
    </div>
  );
};

export default LoginBackgroundUploader;
