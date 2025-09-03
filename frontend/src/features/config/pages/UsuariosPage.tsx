'use client';
import React, { useEffect, useState } from 'react';
import { FaTrash, FaEdit, FaIdBadge, FaTh, FaThList } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import CadastroGoogleStyle from '../components/CadastroGoogleStyle';
import CardUsuario from '../components/CardUsuario';
import api from '../../../services/api';
import type { Usuario } from '../../../types/usuario/usuarioTypes';
import { resolveAvatar } from '../../../utils/avatar';

/* ----------------------------- Helpers ----------------------------- */
// ---------- Helpers ----------
const limparNaoDigitos = (v: string) => (v || '').replace(/\D/g, '');

const TIPOS = ['adm', 'filiado', 'vendedor'] as const;
type TipoOk = (typeof TIPOS)[number];

const ehTipoOk = (v: any): v is TipoOk =>
  TIPOS.includes(String(v).toLowerCase() as TipoOk);

const normalizarParaApi = (u: Usuario): Usuario => ({
  ...u,
  cpf: limparNaoDigitos(u.cpf),
  // garanta minúsculas conforme o schema/DB
  tipo: String(u.tipo || '').toLowerCase() as TipoOk,
});

const getErroBackend = (e: any) => {
  const status = e?.response?.status;
  const data = e?.response?.data || {};
  const msg = data?.erro || data?.message || e?.message || 'Erro inesperado';
  const det = data?.detalhe || data?.code;
  return status ? `(${status}) ${msg}${det ? ' — ' + det : ''}` : msg;
};


/* ------------------------------ Página ----------------------------- */
const UsuariosPage: React.FC = () => {
  const { temaAtual } = useTheme();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modoCadastro, setModoCadastro] = useState(false);
  const [usuarioEditando, setUsuarioEditando] =
    useState<(Usuario & { id?: string }) | null>(null);
  const [visualModoCard, setVisualModoCard] = useState(true);

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /* ------------------------- Carregar lista ------------------------- */
  const carregarUsuarios = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await api.get('/usuarios');

      const lista: Usuario[] = (res.data || []).map((u: any) => {
        const tipoNorm = String(u?.tipo ?? '')
          .toLowerCase() as TipoOk;
        return {
          id: u.id,
          nome: u.nome ?? '',
          cpf: String(u.cpf ?? ''),
          senha: '', // nunca vem do backend
          tipo: ehTipoOk(tipoNorm) ? tipoNorm : 'vendedor',
          filialId: u.filialId ?? null,
          email: u.email ?? undefined,
          cidade: u.cidade ?? undefined,
          nascimento: u.nascimento ?? undefined,
          whatsapp: u.whatsapp ?? undefined,
          avatar: u.avatar ?? null,
        };
      });

      if ((import.meta as any)?.env?.DEV) {
        console.table(
          lista.map((u) => ({
            nome: u.nome,
            tipo: u.tipo,
            avatar_api: u.avatar,
            avatar_resolvido: resolveAvatar(u.avatar),
          }))
        );
      }

      setUsuarios(lista);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
      setErro(getErroBackend(e) || 'Não foi possível carregar os usuários.');
    } finally {
      setCarregando(false);
    }
  };

  /* ----------------- Criar/Editar + Upload de avatar ---------------- */
  const salvarUsuario = async (usuario: Usuario, avatarFile?: File | null) => {
    setErro(null);
    setSalvando(true);
    const payload = normalizarParaApi(usuario);

    try {
      if (usuarioEditando?.cpf) {
        // ---------- PUT (edição)
        const cpfChave = limparNaoDigitos(usuarioEditando.cpf);

        const {
          senha,
          cpf: _cpfIgnorar,
          id: _idIgnorar,
          avatar: _avatarIgnorar,
          ...rest
        } = payload;

        const bodyPut: any = { ...rest };
        if (senha && senha.trim()) bodyPut.senha = senha;

        if ((import.meta as any)?.env?.DEV) {
          console.log('PUT /usuarios payload:', bodyPut);
        }

        await api.put(`/usuarios/${cpfChave}`, bodyPut);

        if (avatarFile) {
          try {
            const fd = new FormData();
            fd.append('avatar', avatarFile);
            const up = await api.post(`/usuarios/${cpfChave}/avatar`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            const novoAvatar: string | undefined = up?.data?.avatar;
            if (novoAvatar) {
              setUsuarios((prev) =>
                prev.map((u) =>
                  limparNaoDigitos(u.cpf) === cpfChave ? { ...u, avatar: novoAvatar } : u
                )
              );
            }
          } catch (e) {
            console.error('Erro no upload de avatar:', e);
            setErro(getErroBackend(e) || 'Erro ao enviar o avatar.');
          }
        }
      } else {
        // ---------- POST (criação)
        if (!payload.senha || !payload.senha.trim()) {
          setErro('A senha é obrigatória para criar um novo usuário.');
          setSalvando(false);
          return;
        }

        const { avatar: _avatarIgnorar, ...bodyPost } = payload;

        if ((import.meta as any)?.env?.DEV) {
          console.log('POST /usuarios payload:', bodyPost);
        }

        await api.post('/usuarios', bodyPost);

        if (avatarFile) {
          try {
            const fd = new FormData();
            fd.append('avatar', avatarFile);
            const up = await api.post(`/usuarios/${bodyPost.cpf}/avatar`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            const novoAvatar: string | undefined = up?.data?.avatar;
            if (novoAvatar) {
              setUsuarios((prev) =>
                prev.map((u) =>
                  limparNaoDigitos(u.cpf) === bodyPost.cpf ? { ...u, avatar: novoAvatar } : u
                )
              );
            }
          } catch (e) {
            console.error('Erro no upload de avatar (novo):', e);
            setErro(getErroBackend(e) || 'Erro ao enviar o avatar.');
          }
        }
      }

      await carregarUsuarios();
      setModoCadastro(false);
      setUsuarioEditando(null);
    } catch (e) {
      console.error('Erro ao salvar usuário:', e);
      setErro(getErroBackend(e) || 'Erro ao salvar. Verifique os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  /* ---------------------------- Remover ---------------------------- */
  const remover = async (cpf?: string) => {
    if (!cpf) return;
    if (!window.confirm('Remover este usuário?')) return;

    setErro(null);
    try {
      await api.delete(`/usuarios/${limparNaoDigitos(cpf)}`);
      await carregarUsuarios();
    } catch (e) {
      console.error('Erro ao remover usuário:', e);
      setErro(getErroBackend(e) || 'Erro ao remover usuário.');
    }
  };

  /* ---------------------------- Callbacks --------------------------- */
  const handleSubmitForm = (usuario: Usuario, avatarFile?: File | null) => {
    if (salvando) return;

    if (!usuario.nome?.trim()) return setErro('Informe o nome.');

    const cpfLimpo = limparNaoDigitos(usuario.cpf);
    if (!cpfLimpo || cpfLimpo.length !== 11)
      return setErro('CPF inválido. Use 11 dígitos.');

    const tipoMin = String(usuario.tipo || '').toLowerCase();
    if (!ehTipoOk(tipoMin))
      return setErro('Tipo inválido. Use: adm, filiado ou vendedor.');

    if (!usuarioEditando?.cpf && !usuario.senha?.trim()) {
      return setErro('A senha é obrigatória para criar um novo usuário.');
    }

    salvarUsuario({ ...usuario, cpf: cpfLimpo, tipo: tipoMin as TipoOk }, avatarFile);
  };

  const editar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setModoCadastro(true);
  };

  useEffect(() => {
    carregarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------- UI ------------------------------ */
  return (
    <div
      className="p-6 min-h-screen"
      style={{ background: temaAtual.fundo, color: temaAtual.texto }}
    >
      {modoCadastro ? (
        <CadastroGoogleStyle
          onSubmit={handleSubmitForm}
          onCancel={() => {
            setModoCadastro(false);
            setUsuarioEditando(null);
          }}
          usuarioEditando={usuarioEditando}
          salvando={salvando}
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
                className="px-4 py-2 rounded font-semibold text-sm disabled:opacity-60"
                style={{ background: temaAtual.destaque, color: temaAtual.textoBranco }}
                disabled={salvando || carregando}
              >
                + Novo Usuário
              </button>
            </div>
          </div>

          {erro && (
            <div
              className="mb-4 text-sm rounded px-3 py-2"
              style={{ background: '#7f1d1d', color: '#fff' }}
            >
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="opacity-80">Carregando...</div>
          ) : visualModoCard ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {usuarios.map((u) => (
                <CardUsuario
                  key={u.id || u.cpf}
                  usuario={{
                    nome: u.nome,
                    email: u.email ?? '',
                    tipo: u.tipo,
                    avatar: u.avatar ?? null,
                  }}
                  onEditar={() => editar(u)}
                  onRemover={() => remover(u.cpf)}
                />
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
                    <tr
                      key={u.id || u.cpf}
                      style={{ background: temaAtual.card, color: temaAtual.texto }}
                    >
                      <td className="border px-3 py-2">{u.nome}</td>
                      <td className="border px-3 py-2">{u.cpf}</td>
                      <td className="border px-2 py-2 text-center">
                        {u.tipo}
                      </td>
                      <td className="border px-2 py-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => remover(u.cpf)}
                            className="hover:scale-110 transition text-red-600 text-sm"
                            title="Remover"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => editar(u)}
                            className="hover:scale-110 transition text-blue-500 text-sm"
                            title="Editar"
                          >
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
