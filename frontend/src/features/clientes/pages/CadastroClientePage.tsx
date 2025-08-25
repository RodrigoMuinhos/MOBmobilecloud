'use client';
import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Cliente } from '../../../types/domain/cliente.types';
import api from '../../../services/api';

const clienteInicial: Cliente = {
  id: '', nome: '', cpf: '', whatsapp: '', email: '', endereco: '', cep: '',
  bairro: '', cidade: '', estado: '', numero: '', complemento: '', nascimento: '',
  genero: '', profissao: '', empresa: '', criadoEm: '', atualizadoEm: '',
  sincronizado: false, incompleto: false, uf: '', vendedorId: '',
};

const CadastroClientePage: React.FC = () => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.ficha;

  const [cliente, setCliente] = useState<Cliente>(clienteInicial);
  const [cpfValido, setCpfValido] = useState(true);
  const [totalCpf, setTotalCpf] = useState(0);

  useEffect(() => {
    api.get('/clientes').then(res => {
      const cpfsUnicos = new Set(res.data.map((c: Cliente) => c.cpf));
      setTotalCpf(cpfsUnicos.size);
    });
  }, []);

  useEffect(() => {
    const cepLimpo = cliente.cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setCliente(prev => ({
              ...prev,
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              estado: data.uf || '',
              endereco: prev.endereco || data.logradouro || '',
            }));
          }
        });
    }
  }, [cliente.cep]);

  const validarCPF = (cpf: string): boolean => {
    const c = cpf.replace(/\D/g, '');
    if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
    const calc = (f: number) => c.substring(0, f - 1).split('').reduce((s, n, i) => s + parseInt(n) * (f - i), 0);
    const d1 = ((calc(10) * 10) % 11) % 10;
    const d2 = ((calc(11) * 10) % 11) % 10;
    return d1 === parseInt(c[9]) && d2 === parseInt(c[10]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = value;

    if (name === 'cpf') {
      val = val.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setCpfValido(validarCPF(val));
    }

    if (name === 'whatsapp') {
      val = val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{4})$/, '$1-$2');
    }

    setCliente(prev => ({ ...prev, [name]: val }));
  };

  const salvarCliente = async () => {
    if (!cliente.nome || !cliente.whatsapp || !cliente.cpf) {
      return alert(t?.preencherCampos ?? 'Preencha os campos obrigatórios.');
    }

    try {
      const res = await api.post('/clientes', {
        ...cliente,
        cpf: cliente.cpf.replace(/\D/g, ''),
        criadoEm: new Date().toISOString(),
      });

      if (res.status === 200 || res.status === 201) {
        alert(t?.cadastradoComSucesso ?? 'Cliente cadastrado com sucesso!');
        setCliente(clienteInicial);
        const r = await api.get('/clientes');
        setTotalCpf(new Set(r.data.map((c: Cliente) => c.cpf)).size);
      }
    } catch (err: any) {
      if (err.response?.data?.message?.includes('unique constraint')) {
        alert(t?.cpfDuplicado ?? 'CPF já cadastrado!');
      } else {
        console.error(err);
        alert('Erro ao salvar cliente.');
      }
    }
  };

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: temaAtual.destaque }}>
        {t?.cadastroTitulo ?? 'Cadastro de Cliente'}
      </h1>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>{t?.progressoCadastro ?? 'Progresso de Cadastro'}</span>
          <span>{totalCpf}/100</span>
        </div>
        <div className="w-full bg-gray-300 rounded h-3 overflow-hidden">
          <div className="h-full rounded transition-all duration-500"
            style={{ width: `${Math.min(totalCpf, 100)}%`, backgroundColor: temaAtual.destaque }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-800 p-6 rounded shadow"
        style={{ backgroundColor: temaAtual.card }}>
        {[
          ['nome', t?.nome],
          ['whatsapp', t?.whatsapp],
          ['email', t?.email],
          ['endereco', t?.endereco],
          ['bairro', 'Bairro'],
          ['cidade', 'Cidade'],
          ['estado', 'Estado'],
        ].map(([name, placeholder]) => (
          <input key={name} name={name} value={(cliente as any)[name]} placeholder={placeholder}
            onChange={handleChange}
            className="border rounded px-4 py-2"
            style={{ backgroundColor: temaAtual.input, color: temaAtual.texto, borderColor: temaAtual.destaque }}
          />
        ))}

        <div className="relative">
          <input name="cpf" value={cliente.cpf} placeholder={t?.cpf} onChange={handleChange}
            className={`border rounded px-4 py-2 w-full pr-10 ${cpfValido ? '' : 'border-red-500'}`}
            style={{ backgroundColor: temaAtual.input, color: temaAtual.texto, borderColor: cpfValido ? temaAtual.destaque : 'red' }}
          />
          {cliente.cpf.length >= 14 && (
            <span className="absolute top-2.5 right-3">
              {cpfValido ? <FaCheckCircle className="text-green-500" /> : <FaExclamationCircle className="text-red-500" />}
            </span>
          )}
        </div>

        <input name="cep" value={cliente.cep} placeholder={t?.cep}
          onChange={handleChange}
          className="border rounded px-4 py-2"
          style={{ backgroundColor: temaAtual.input, color: temaAtual.texto, borderColor: temaAtual.destaque }}
        />
        <input name="nascimento" type="date" value={cliente.nascimento} onChange={handleChange}
          className="border rounded px-4 py-2"
          style={{ backgroundColor: temaAtual.input, color: temaAtual.texto, borderColor: temaAtual.destaque }}
        />
      </div>

      <button onClick={salvarCliente}
        className="mt-6 px-6 py-2 rounded font-semibold"
        style={{ backgroundColor: temaAtual.destaque, color: temaAtual.card }}>
        {t?.botaoSalvar ?? 'Salvar Cliente'}
      </button>
    </div>
  );
};

export default CadastroClientePage;
