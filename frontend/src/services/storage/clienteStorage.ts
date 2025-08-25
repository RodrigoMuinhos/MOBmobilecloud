import { Cliente } from '../../types/banco'; // ajuste o caminho se necessário

const CHAVE = 'clientesMOB';

export const clienteStorage = {
  listar(): Cliente[] {
    try {
      const dados = localStorage.getItem(CHAVE);
      return dados ? JSON.parse(dados) : [];
    } catch {
      return [];
    }
  },

  salvar(cliente: Cliente): void {
    const lista = clienteStorage.listar();
    lista.push(cliente);
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  },

  atualizarTodos(novos: Cliente[]): void {
    localStorage.setItem(CHAVE, JSON.stringify(novos));
  },

  limpar(): void {
    localStorage.removeItem(CHAVE);
  },

  buscarPorCPF(cpf: string): Cliente | undefined {
    return clienteStorage.listar().find(c => c.cpf === cpf);
  }
};
