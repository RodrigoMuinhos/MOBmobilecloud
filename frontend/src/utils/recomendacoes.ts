type Cliente = {
  nomeTitular?: string | null;
  nomeFantasia?: string | null;
  distrito?: string | null;
  produtosFavoritos?: string[];
  ultimaCompra?: string; // data em ISO
};

export function gerarMensagemLembrete(cliente: Cliente): string {
  const nome = cliente.nomeTitular || cliente.nomeFantasia || 'cliente';
  const cidade = cliente.distrito || 'sua cidade';
  const favorito = cliente.produtosFavoritos?.[0] || 'nossos produtos';
  const ultima = cliente.ultimaCompra
    ? new Date(cliente.ultimaCompra).toLocaleDateString('pt-BR')
    : null;

  let msg = `Olá ${nome}, tudo certo?\n\n`;
  msg += `Estamos com novidades para ${cidade} e achamos que você pode gostar.\n`;

  if (ultima) {
    msg += `Você fez sua última compra em ${ultima}. Já pensou em renovar seu estoque?\n`;
  }

  msg += `Condições especiais nos seus favoritos: ${favorito}.\n`;
  msg += `\nFale com a gente para garantir sua oferta!`;

  return msg;
}