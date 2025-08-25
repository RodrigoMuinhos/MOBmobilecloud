import React, { useEffect, useState } from 'react';
import { FaTrash, FaEdit, FaIdBadge, FaTh, FaThList } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import CadastroGoogleStyle from '../components/CadastroGoogleStyle';
import api from '../../../services/api';
import type { Usuario } from '../../../types/usuario/usuarioTypes';

// ---------- Helpers ----------
const PLACEHOLDER = '/user-placeholder.png';
const limparNaoDigitos = (v: string) => (v || '').replace(/\D/g, '');

const isTipoUsuario = (v: any): v is Usuario['tipo'] =>
  v === 'adm' || v === 'filiado' || v === 'vendedor';

const normalizarParaApi = (u: Usuario): Usuario => ({
  ...u,
  cpf: limparNaoDigitos(u.cpf),
});

// Garante uma URL segura pro <img>
const safeAvatar = (v?: string | null) => {
  if (typeof v !== 'string') return PLACEHOLDER;
  const s = v.trim();
  if (!s) return PLACEHOLDER;
  if (/^https?:\/\//i.test(s) || s.startsWith('data:image')) return s;
  // Caso o backend grave apenas "avatars/arquivo.png", exponha /uploads no server
  // e monte abaixo a URL pública se preferir:
  // const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
  // return `${base}/${s.replace(/^\/+/, '')}`;
  return s;
};

const UsuariosPage: React.FC = () => {
  const { temaAtual } = useTheme();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modoCadastro, setModoCadastro] = useState(false);
  const [usuarioEditando, setUsuarioEditando] =
    useState<(Usuario & { id?: string }) | null>(null);
  const [visualModoCard, setVisualModoCard] = useState(true);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // ---------- Carregar lista ----------
  const carregarUsuarios = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await api.get('/usuarios');
      const lista: Usuario[] = (res.data || []).map((u: any) => ({
        id: u.id,
        nome: u.nome ?? '',
        cpf: String(u.cpf ?? ''),
        senha: '', // nunca vem do backend
        tipo: isTipoUsuario(u.tipo) ? u.tipo : 'vendedor',
        email: u.email ?? undefined,
        cidade: u.cidade ?? undefined,
        nascimento: u.nascimento ?? undefined,
        whatsapp: u.whatsapp ?? undefined,
        avatar: u.avatar ?? null,
      }));
      setUsuarios(lista);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
      setErro('Não foi possível carregar os usuários.');
    } finally {
      setCarregando(false);
    }
  };

  // ---------- Criar/Editar + Upload do avatar ----------
  const salvarUsuario = async (usuario: Usuario, avatarFile?: File | null) => {
    setErro(null);
    const payload = normalizarParaApi(usuario);

    try {
      if (usuarioEditando?.cpf) {
        // Atualiza dados
        const cpfChave = limparNaoDigitos(usuarioEditando.cpf);
        await api.put(`/usuarios/${cpfChave}`, payload);

        // Se tiver avatar novo, faz upload
        if (avatarFile) {
          const fd = new FormData();
          fd.append('avatar', avatarFile);
          await api.post(`/usuarios/${cpfChave}/avatar`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        // Cria usuário
        await api.post('/usuarios', payload);

        // Upload do avatar usando o CPF recém-criado
        if (avatarFile) {
          const fd = new FormData();
          fd.append('avatar', avatarFile);
          await api.post(`/usuarios/${payload.cpf}/avatar`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }

      await carregarUsuarios();
      setModoCadastro(false);
      setUsuarioEditando(null);
    } catch (e) {
      console.error('Erro ao salvar usuário:', e);
      setErro('Erro ao salvar. Verifique os dados e tente novamente.');
    }
  };

  // ---------- Remover ----------
  const remover = async (cpf?: string) => {
    if (!cpf) return;
    if (!window.confirm('Remover este usuário?')) return;

    setErro(null);
    try {
      await api.delete(`/usuarios/${limparNaoDigitos(cpf)}`);
      await carregarUsuarios();
    } catch (e) {
      console.error('Erro ao remover usuário:', e);
      setErro('Erro ao remover usuário.');
    }
  };

  // ---------- Callbacks ----------
  const handleSubmitForm = (usuario: Usuario, avatarFile?: File | null) => {
    salvarUsuario(usuario, avatarFile);
  };

  const editar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setModoCadastro(true);
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // ---------- UI ----------
  return (
    <div className="p-6 min-h-screen" style={{ background: temaAtual.fundo, color: temaAtual.texto }}>
      {modoCadastro ? (
        <CadastroGoogleStyle
          onSubmit={handleSubmitForm}
          onCancel={() => { setModoCadastro(false); setUsuarioEditando(null); }}
          usuarioEditando={usuarioEditando}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaIdBadge /> Usuários Cadastrados
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setVisualModoCard(!visualModoCard)}
                className="px-3 py-2 rounded shadow border border-white hover:scale-105 transition"
                style={{ background: temaAtual.card, color: temaAtual.texto }}
                title={visualModoCard ? 'Visualizar em Tabela' : 'Visualizar em Cards'}
              >
                {visualModoCard ? <FaThList /> : <FaTh />}
              </button>
              <button
                onClick={() => setModoCadastro(true)}
                className="px-4 py-2 rounded font-semibold text-sm"
                style={{ background: temaAtual.destaque, color: temaAtual.textoBranco }}
              >
                + Novo Usuário
              </button>
            </div>
          </div>

          {erro && (
            <div className="mb-4 text-sm rounded px-3 py-2" style={{ background: '#7f1d1d', color: '#fff' }}>
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="opacity-80">Carregando...</div>
          ) : visualModoCard ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {usuarios.map((u) => (
                <div
                  key={u.id || u.cpf}
                  className="rounded-lg shadow-md p-4 flex items-center gap-4"
                  style={{ background: temaAtual.card, color: temaAtual.texto }}
                >
                  <img
                    src={safeAvatar(u.avatar)}
                    alt={u.nome}
                    className="w-16 h-16 rounded-full object-cover border"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).onerror = null;
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="font-bold text-lg">{u.nome}</h2>
                    <p className="text-sm opacity-80">{u.cpf}</p>
                    <span className="text-xs capitalize opacity-70">{u.tipo}</span>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button onClick={() => editar(u)} className="text-blue-500 hover:scale-110 transition">
                      <FaEdit />
                    </button>
                    <button onClick={() => remover(u.cpf)} className="text-red-600 hover:scale-110 transition">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              {usuarios.length === 0 && (
                <div className="col-span-full text-center opacity-70 py-6">
                  Nenhum usuário encontrado.
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-auto rounded shadow">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: temaAtual.card }}>
                    <th className="border px-3 py-2 text-left">Nome</th>
                    <th className="border px-3 py-2 text-left">CPF</th>
                    <th className="border px-2 py-2 text-center">Tipo</th>
                    <th className="border px-2 py-2 text-center w-24">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id || u.cpf} style={{ background: temaAtual.card, color: temaAtual.texto }}>
                      <td className="border px-3 py-2">{u.nome}</td>
                      <td className="border px-3 py-2">{u.cpf}</td>
                      <td className="border px-2 py-2 text-center capitalize">{u.tipo}</td>
                      <td className="border px-2 py-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => remover(u.cpf)} className="hover:scale-110 transition text-red-600 text-sm">
                            <FaTrash />
                          </button>
                          <button onClick={() => editar(u)} className="hover:scale-110 transition text-blue-500 text-sm">
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 opacity-70">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsuariosPage;
