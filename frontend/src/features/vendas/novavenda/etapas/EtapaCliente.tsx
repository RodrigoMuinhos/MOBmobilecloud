'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { Cliente } from '../../../../types/domain/cliente.types';
import { formatarCPF, validarCPF } from '../helpers/cpfUtils';
import BotaoSalvarCliente from '../botao/BotaoSalvarCliente';
import api from '../../../../services/api';

interface Props {
  cliente: Cliente;
  setCliente: (c: Cliente) => void;
}

const EtapaCliente: React.FC<Props> = ({ cliente, setCliente }) => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.clientes;

  const [clientesSalvos, setClientesSalvos] = useState<Cliente[]>([]);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [cpfValido, setCpfValido] = useState(true);
  const [cpfJaCadastrado, setCpfJaCadastrado] = useState(false);
  const [sugestoes, setSugestoes] = useState<Cliente[]>([]);

  const inputStyle = {
    backgroundColor: temaAtual.input,
    color: temaAtual.texto,
    borderColor: temaAtual.contraste,
  };

  useEffect(() => {
    const buscarClientes = async () => {
      try {
        const res = await api.get('/clientes');

        const lista = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.clientes)
          ? res.data.clientes
          : [];

        setClientesSalvos(lista);
      } catch (err) {
        console.error('❌ Erro ao buscar clientes:', err);
        setClientesSalvos([]);
      } finally {
        setCarregandoClientes(false);
      }
    };

    buscarClientes();
  }, []);

  useEffect(() => {
    const buscarEnderecoPorCEP = async () => {
      const cepLimpo = cliente.cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) return;

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (data?.erro) return;

        setCliente({
          ...cliente,
          endereco: capitalizar(data.logradouro || cliente.endereco),
          bairro: capitalizar(data.bairro || cliente.bairro),
          cidade: capitalizar(data.localidade || cliente.cidade),
          estado: data.uf || cliente.estado,
          uf: data.uf || cliente.uf,
        });
      } catch (error) {
        console.error('Erro ao buscar endereço por CEP:', error);
      }
    };

    if (cliente.cep.length === 9) {
      buscarEnderecoPorCEP();
    }
  }, [cliente.cep]);

  const aplicarMascara = {
    whatsapp: (v: string) => {
      const limpo = v.replace(/\D/g, '').slice(0, 11);
      return limpo.length <= 10
        ? limpo.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
        : limpo.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
    },
    cep: (v: string) =>
      v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d{0,3})/, '$1-$2'),
  };

  const capitalizar = (texto: string): string =>
    texto.toLowerCase().replace(/(?:^|\s)\S/g, (l) => l.toUpperCase());

  const normalizar = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const preencherCliente = (c: Cliente) => {
    setCliente({
      id: c.id?.length === 36 ? c.id : '',
      criadoEm: c.criadoEm || new Date().toISOString(),
      nome: capitalizar(c.nome || ''),
      cpf: formatarCPF(c.cpf || ''),
      whatsapp: aplicarMascara.whatsapp(c.whatsapp || ''),
      endereco: capitalizar(c.endereco || ''),
      cep: aplicarMascara.cep(c.cep || ''),
      estado: c.estado || '',
      nascimento: c.nascimento || '',
      uf: c.uf || '',
      cidade: capitalizar(c.cidade || ''),
    });
  };

  const handleNome = (nome: string) => {
    const nomeFormatado = capitalizar(nome);
    setCliente({ ...cliente, nome: nomeFormatado });

    if (nome.length < 1) {
      setSugestoes([]);
      return;
    }

    const filtrados = clientesSalvos.filter((c) =>
      normalizar(c.nome).includes(normalizar(nome))
    );
    setSugestoes(filtrados);

    const clienteExato = clientesSalvos.find(
      (c) => normalizar(c.nome) === normalizar(nome)
    );
    if (clienteExato) preencherCliente(clienteExato);
  };

  const selecionarSugestao = (c: Cliente) => {
    preencherCliente(c);
    setSugestoes([]);
  };

  const handleCpf = (valor: string) => {
    const cpf = formatarCPF(valor);
    setCliente({ ...cliente, cpf });

    const valido = validarCPF(cpf);
    setCpfValido(valido);

    const jaExiste = clientesSalvos.some(
      (c) => c.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, '')
    );
    setCpfJaCadastrado(jaExiste);

    if (jaExiste) {
      const encontrado = clientesSalvos.find(
        (c) => c.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, '')
      );
      if (encontrado) preencherCliente(encontrado);
    }
  };

  return (
    <div className="space-y-4">
      {carregandoClientes && (
        <p className="text-sm italic text-gray-400">Carregando clientes...</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder={t.nome}
            className="border p-2 rounded w-full"
            value={cliente.nome}
            onChange={(e) => handleNome(e.target.value)}
            style={inputStyle}
          />
          {sugestoes.length > 0 && (
            <ul
              style={{
                zIndex: 9999,
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: temaAtual.card,
                color: temaAtual.texto,
                border: `1px solid ${temaAtual.contraste}`
              }}
              className="rounded w-full max-h-48 overflow-auto shadow"
            >
              {sugestoes.map((s, i) => (
                <li
                  key={i}
                  className="px-3 py-2 hover:opacity-80 cursor-pointer"
                  onClick={() => selecionarSugestao(s)}
                >
                  {capitalizar(s.nome)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="text"
          placeholder={t.whatsapp}
          className="border p-2 rounded w-full"
          value={cliente.whatsapp}
          onChange={(e) =>
            setCliente({ ...cliente, whatsapp: aplicarMascara.whatsapp(e.target.value) })
          }
          style={inputStyle}
        />

        <input
          type="text"
          placeholder={t.endereco}
          className="border p-2 rounded w-full"
          value={cliente.endereco}
          onChange={(e) => setCliente({ ...cliente, endereco: capitalizar(e.target.value) })}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="CPF"
            className={`border p-2 rounded w-full pr-24 ${cpfValido ? '' : 'border-red-500'}`}
            value={cliente.cpf}
            onChange={(e) => handleCpf(e.target.value)}
            style={inputStyle}
          />
          {cliente.cpf && (
            <span
              className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
                cpfJaCadastrado ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {cpfJaCadastrado ? 'CPF cadastrado' : 'Novo CPF'}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="CEP"
            className="border p-2 rounded w-full"
            value={cliente.cep}
            onChange={(e) =>
              setCliente({ ...cliente, cep: aplicarMascara.cep(e.target.value) })
            }
            style={inputStyle}
          />
          <select
            className="border p-2 rounded w-24"
            value={cliente.estado || ''}
            onChange={(e) => setCliente({ ...cliente, estado: e.target.value, uf: e.target.value })}
            style={inputStyle}
          >
            <option value="">UF</option>
            <option value="CE">CE</option>
            <option value="PA">PA</option>
            <option value="PE">PE</option>
          </select>
        </div>

        <div className="flex gap-2 items-center">
 <input
  type="date"
  className="border p-2 rounded w-full"
  value={cliente.nascimento ? cliente.nascimento.slice(0, 10) : ''}
  onChange={(e) => setCliente({ ...cliente, nascimento: e.target.value })}
  style={inputStyle}
/>
          <BotaoSalvarCliente cliente={cliente} />
        </div>
      </div>
    </div>
  );
};

export default EtapaCliente;
