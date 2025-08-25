import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaUserPlus, FaKey, FaUserShield, FaIdCard, FaImage } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import type { Usuario } from '../../../types/usuario/usuarioTypes';

interface CadastroProps {
  onSubmit: (usuario: Usuario, avatarFile?: File | null) => void;
  onCancel: () => void;
  usuarioEditando?: (Usuario & { id?: string }) | null;
}

const PLACEHOLDER = '/user-placeholder.png';

const CadastroGoogleStyle: React.FC<CadastroProps> = ({
  onSubmit, onCancel, usuarioEditando,
}) => {
  const { temaAtual } = useTheme();

  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<Usuario['tipo'] | ''>('');
  const [cpf, setCpf] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');         // string para preview (URL existente ou blob)
  const [avatarFile, setAvatarFile] = useState<File|null>(null); // arquivo selecionado
  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (usuarioEditando) {
      setNome(usuarioEditando.nome || '');
      setSenha('');
      setTipo((usuarioEditando.tipo as Usuario['tipo']) || '');
      setCpf(formatarCPF(usuarioEditando.cpf || ''));
      setAvatarUrl(usuarioEditando.avatar ?? ''); // pode ser URL completa
      setAvatarFile(null);
    } else {
      setNome(''); setSenha(''); setTipo(''); setCpf('');
      setAvatarUrl(''); setAvatarFile(null);
    }
  }, [usuarioEditando]);

  const validarCPF = (v: string) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v);
  const formatarCPF = (v: string) => {
    const s = (v || '').replace(/\D/g, '').slice(0, 11);
    return s.replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };
  const normalizarCPF = (v: string) => (v || '').replace(/\D/g, '');

  const formValido = nome.trim() && senha.trim() && tipo && validarCPF(cpf);

  // preview seguro
  const previewSrc = useMemo(
    () => (avatarUrl?.trim() ? avatarUrl.trim() : PLACEHOLDER),
    [avatarUrl]
  );
  const [imgOk, setImgOk] = useState(true);

  // abrir seletor ao clicar no avatar
  const abrirSeletor = () => inputFileRef.current?.click();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarUrl(URL.createObjectURL(f)); // preview imediato
    setImgOk(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValido) return;

    const novoUsuario: Usuario = {
      nome: nome.trim(),
      senha: senha.trim(),
      tipo: tipo as Usuario['tipo'],
      cpf: normalizarCPF(cpf),
      // avatar NÃO vai aqui; o arquivo será enviado separado no UsuariosPage
    };
    onSubmit(novoUsuario, avatarFile);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6" style={{ background: temaAtual.fundo }}>
      <div className="w-full max-w-xl rounded-3xl shadow-xl backdrop-blur-md"
           style={{ background: `${temaAtual.card}cc`, border: `1px solid ${temaAtual.destaque}`, color: temaAtual.texto }}>
        <div className="flex flex-col items-center p-6 pb-0">
          <button type="button" onClick={abrirSeletor}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden focus:outline-none"
                  title="Clique para escolher uma foto">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img
              src={imgOk ? previewSrc : PLACEHOLDER}
              className="w-full h-full object-cover"
              onError={() => setImgOk(false)}
              onLoad={() => setImgOk(true)}
            />
          </button>
          <input
            ref={inputFileRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          <p className="text-xs mt-2 opacity-70 flex items-center gap-1">
            <FaImage /> Clique no avatar para escolher a foto (opcional)
          </p>

          <h2 className="text-2xl font-bold mt-3">
            {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 grid grid-cols-1 gap-4">
          <label className="flex items-center gap-2">
            <FaUserPlus className="text-gray-400" />
            <input type="text" placeholder="Nome (login)" value={nome}
                   onChange={(e) => setNome(e.target.value)}
                   className="w-full p-2 rounded-md border focus:outline-none"
                   style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }} required />
          </label>

          <label className="flex items-center gap-2">
            <FaIdCard className="text-gray-400" />
            <input type="text" placeholder="CPF" value={cpf}
                   onChange={(e) => setCpf(formatarCPF(e.target.value))}
                   disabled={!!usuarioEditando}
                   className="w-full p-2 rounded-md border focus:outline-none"
                   style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }} required />
          </label>

          <label className="flex items-center gap-2">
            <FaKey className="text-gray-400" />
            <input type="password" placeholder="Senha" value={senha}
                   onChange={(e) => setSenha(e.target.value)}
                   className="w-full p-2 rounded-md border focus:outline-none"
                   style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }} required />
          </label>

          <label className="flex items-center gap-2">
            <FaUserShield className="text-gray-400" />
            <select value={tipo} onChange={(e) => setTipo(e.target.value as Usuario['tipo'])}
                    className="w-full p-2 rounded-md border focus:outline-none"
                    style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }} required>
              <option value="">Tipo de usuário</option>
              <option value="adm">Administrador</option>
              <option value="filiado">Filiado</option>
              <option value="vendedor">Vendedor</option>
            </select>
          </label>

          <div className="flex justify-between gap-4 mt-2">
            <button type="submit" disabled={!formValido}
                    className="flex-1 bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition">
              {usuarioEditando ? 'Salvar alterações' : 'Cadastrar usuário'}
            </button>
            <button type="button" onClick={onCancel}
                    className="flex-1 bg-gray-400 text-black font-bold py-2 rounded-md hover:bg-gray-500 transition">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroGoogleStyle;
