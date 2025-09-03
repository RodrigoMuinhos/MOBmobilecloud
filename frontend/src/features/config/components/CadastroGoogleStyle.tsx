// src/features/config/components/CadastroGoogleStyle.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaUserPlus, FaKey, FaUserShield, FaIdCard, FaImage,
  FaEnvelope, FaPhone, FaBuilding, FaEye, FaEyeSlash,
} from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import type { Usuario } from '../../../types/usuario/usuarioTypes';
import { PLACEHOLDER, resolveAvatar } from '../../../utils/avatar';
import api from '../../../services/api';

type FilialAPI = { id: string; nome: string; uf?: string | null; cidade?: string | null };

export interface CadastroProps {
  onSubmit: (usuario: Usuario, avatarFile?: File | null) => void;
  onCancel: () => void;
  usuarioEditando?: (Usuario & { id?: string }) | null;
  salvando?: boolean;
}

const CadastroGoogleStyle: React.FC<CadastroProps> = ({
  onSubmit,
  onCancel,
  usuarioEditando,
  salvando = false,
}) => {
  const { temaAtual } = useTheme();
  const isEdit = !!usuarioEditando;

  // obrigatórios
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  // >>> tipo agora em MAIÚSCULO (ADM | GER | VEN) ou vazio no form
  const [tipo, setTipo] = useState<Usuario['tipo'] | ''>('');
  const [cpf, setCpf] = useState('');

  // extras
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Filial
  const [filiais, setFiliais] = useState<FilialAPI[]>([]);
  const [filialId, setFilialId] = useState<string>('');

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  /* ----------------- efeitos ----------------- */
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/filiais');
        setFiliais(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        console.error('Falha ao carregar filiais', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (usuarioEditando) {
      setNome(usuarioEditando.nome || '');
      setSenha('');
      setTipo((usuarioEditando.tipo as Usuario['tipo']) || '');
      setCpf(formatarCPF(usuarioEditando.cpf || ''));
      setEmail((usuarioEditando as any).email ?? '');
      setWhatsapp(formatarWhats((usuarioEditando as any).whatsapp ?? ''));
      setFilialId((usuarioEditando as any).filialId || '');
      setAvatarUrl(usuarioEditando.avatar ?? '');
      setAvatarFile(null);
      setImgError(false);
    } else {
      setNome('');
      setSenha('');
      setTipo('');
      setCpf('');
      setEmail('');
      setWhatsapp('');
      setFilialId('');
      setAvatarUrl('');
      setAvatarFile(null);
      setImgError(false);
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [usuarioEditando]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  /* ----------------- helpers ----------------- */
  const validarCPF = (v: string) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v);
  const formatarCPF = (v: string) => {
    const s = (v || '').replace(/\D/g, '').slice(0, 11);
    return s.replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };
  const normalizarCPF = (v: string) => (v || '').replace(/\D/g, '');

  const validarEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
  const formatarWhats = (v: string) => {
    const s = (v || '').replace(/\D/g, '').slice(0, 11);
    if (s.length <= 10) return s.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    return s.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };
  const normalizarWhats = (v: string) => (v || '').replace(/\D/g, '');

  const senhaObrigatoria = !isEdit;
  const formValido = Boolean(
    nome.trim() &&
      tipo &&
      validarCPF(cpf) &&
      filialId &&
      validarEmail(email) &&
      (senhaObrigatoria ? senha.trim() : true)
  );

  const previewSrc = useMemo(
    () => (imgError ? PLACEHOLDER : resolveAvatar(avatarUrl)),
    [avatarUrl, imgError]
  );

  /* --------------- avatar ui --------------- */
  const abrirSeletor = () => inputFileRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setAvatarFile(f);
    setAvatarUrl(url);
    setImgError(false);
  };

  /* ----------------- submit ----------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValido || salvando) return;

    // garante MAIÚSCULO para o backend (ADM | GER | VEN)
    const tipoUP = String(tipo || '').toUpperCase() as Usuario['tipo'];

    const novoUsuario: Usuario = {
      nome: nome.trim(),
      senha: senha.trim(), // na edição pode ir '' e o PUT ignora
      tipo: tipoUP,
      cpf: normalizarCPF(cpf),
      filialId: filialId || null,
      email: email.trim().toLowerCase(),
      whatsapp: normalizarWhats(whatsapp),
    };

    onSubmit(novoUsuario, avatarFile);
  };

  /* ----------------- render ----------------- */
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6"
         style={{ background: temaAtual.fundo }}>
      <div className="w-full max-w-xl rounded-3xl shadow-xl backdrop-blur-md"
           style={{ background: `${temaAtual.card}cc`, border: `1px solid ${temaAtual.destaque}`, color: temaAtual.texto }}>
        {/* Cabeçalho + Avatar */}
        <div className="flex flex-col items-center p-6 pb-0">
          <button type="button" onClick={abrirSeletor}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden focus:outline-none disabled:opacity-60"
                  title="Clique para escolher uma foto" disabled={salvando}>
            <img src={previewSrc} alt="Avatar do usuário" className="w-full h-full object-cover"
                 loading="lazy" draggable={false}
                 onError={(ev) => { ev.currentTarget.onerror = null; setImgError(true); }} />
          </button>

          <input ref={inputFileRef} type="file" accept="image/*"
                 onChange={onFileChange} className="hidden" disabled={salvando} />

          {avatarUrl && (
            <button type="button" className="text-xs underline opacity-70 mt-1 disabled:opacity-60"
                    onClick={() => { setAvatarUrl(''); setAvatarFile(null); setImgError(false); }}
                    disabled={salvando}>
              Remover foto
            </button>
          )}

          <p className="text-xs mt-2 opacity-70 flex items-center gap-1">
            <FaImage /> Clique no avatar para escolher a foto (opcional)
          </p>

          <h2 className="text-2xl font-bold mt-3">
            {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 grid grid-cols-1 gap-4">
          {/* Nome */}
          <label className="flex items-center gap-2">
            <FaUserPlus className="text-gray-400" />
            <input type="text" placeholder="Nome (login)" value={nome}
                   onChange={(e) => setNome(e.target.value)}
                   className="w-full p-2 rounded-md border focus:outline-none"
                   style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }}
                   required disabled={salvando} />
          </label>

          {/* E-mail */}
          <label className="flex items-center gap-2">
            <FaEnvelope className="text-gray-400" />
            <input type="email" placeholder="E-mail" value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full p-2 rounded-md border focus:outline-none"
                   style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }}
                   required disabled={salvando} />
          </label>

          {/* WhatsApp */}
          <label className="flex items-center gap-2">
            <FaPhone className="text-gray-400" />
            <input type="text" placeholder="WhatsApp" value={whatsapp}
                   onChange={(e) => setWhatsapp(formatarWhats(e.target.value))}
                   className="w-full p-2 rounded-md border focus:outline-none"
                   style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }}
                   disabled={salvando} />
          </label>

          {/* CPF */}
          <label className="flex items-center gap-2">
            <FaIdCard className="text-gray-400" />
            <input type="text" placeholder="CPF" value={cpf}
                   onChange={(e) => setCpf(formatarCPF(e.target.value))}
                   disabled={salvando || isEdit}
                   className="w-full p-2 rounded-md border focus:outline-none"
                   style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }}
                   required />
          </label>

          {/* Filial */}
          <label className="flex items-center gap-2">
            <FaBuilding className="text-gray-400" />
            <select value={filialId} onChange={(e) => setFilialId(e.target.value)}
                    className="w-full p-2 rounded-md border focus:outline-none"
                    style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }}
                    required disabled={salvando}>
              <option value="">Selecione a filial</option>
              {filiais.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}{f.cidade ? ` — ${f.cidade}` : ''}{f.uf ? `/${f.uf}` : ''}
                </option>
              ))}
            </select>
          </label>

          {/* Senha com toggle */}
          <label className="flex items-center gap-2 relative">
            <FaKey className="text-gray-400" />
            <input type={mostrarSenha ? 'text' : 'password'}
                   placeholder={isEdit ? 'Senha (deixe em branco para não alterar)' : 'Senha'}
                   value={senha} onChange={(e) => setSenha(e.target.value)}
                   className="w-full p-2 rounded-md border pr-10 focus:outline-none"
                   style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }}
                   required={!isEdit} autoComplete="new-password" disabled={salvando} />
            <button type="button" onClick={() => setMostrarSenha(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                    title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} disabled={salvando}>
              {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
            </button>
          </label>

          {/* Tipo (MAIÚSCULO) */}
          <label className="flex items-center gap-2">
            <FaUserShield className="text-gray-400" />
            <select value={tipo}
                    onChange={(e) => setTipo(e.target.value as Usuario['tipo'])}
                    className="w-full p-2 rounded-md border focus:outline-none"
                    style={{ background: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.destaque }}
                    required disabled={salvando}>
           <option value="">Tipo de usuário</option>
<option value="adm">Administrador</option>
<option value="filiado">Gerente / Filiado</option>
<option value="vendedor">Vendedor</option>

            </select>
          </label>

          {/* Ações */}
          <div className="flex justify-between gap-4 mt-2">
            <button type="submit" disabled={!formValido || salvando}
                    className="flex-1 bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition">
              {salvando ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Cadastrar usuário'}
            </button>
            <button type="button" onClick={onCancel}
                    className="flex-1 bg-gray-400 text-black font-bold py-2 rounded-md hover:bg-gray-500 transition disabled:opacity-60"
                    disabled={salvando}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroGoogleStyle;
