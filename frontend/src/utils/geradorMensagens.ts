import React from 'react';

export const gerarMensagemDoDia = (): string => {
  const r = <T>(lista: T[]): T => lista[Math.floor(Math.random() * lista.length)];

  const saudacoes = [
    "🟡 Fala, artista!",
    "👋 Tudo certo por aí?",
    "✨ Preparado pra mais um dia de traço firme?",
    "🔧 Estúdio já está no ritmo hoje?",
    "🎯 Foco total nas sessões de hoje?",
    "✍️ Começando mais um dia de arte?",
    "🚀 Como estão os trabalhos por aí?",
    "🛎️ Atendimentos a todo vapor?",
    "🖤 Dia bom pra deixar pele com mais personalidade?",
    "🧼 Tudo pronto pra receber os clientes?",
    "📦 Já deu uma olhada no estoque antes de começar?",
  ];

  const mensagensProdutos = [
    "Hoje a dica vai pra quem busca mais detalhe e precisão: 1007MGR SkinkInk, perfeito pra realismo e sutileza.",
    "Quer traço limpo e fino? O 0807RL SkinkInk entrega consistência em cada passada.",
    "Se o foco é controle e firmeza no traço, o 1005RL da VXcraft é a escolha certa.",
    "Pra quem curte bold line marcante e firme: Cartucho 1014RL SkinkInk é a pedida.",
    "Seu traço merece mais qualidade? Testa o 0807RL — leveza, precisão e resultado.",
    "O destaque de hoje é o 1005RL VXcraft — ideal pra traço definido e técnico.",
    "Tá buscando uma pegada mais detalhada no realismo? Vai de 1007MGR SkinkInk.",
    "Cartucho 1014RL: traço cheio, sólido e seguro — ótimo pra contornos pesados.",
    "Quem usa o 0807RL sente a diferença logo nos primeiros segundos. Preciso e leve.",
    "Testou o 1005RL VX? Se ainda não, vale a pena. Estabilidade e precisão na medida.",
  ];

  const ofertas = [
    "🛍️ E hoje tem mimo: pedidos acima de R$349 ganham frete grátis na hora.",
    "📦 Compras acima de R$300 hoje levam frete por nossa conta — aproveite!",
    "🚚 Frete gratuito liberado nas compras acima de R$249 até o fim do dia.",
    "💸 Acima de R$199 o frete é por nossa conta — leve mais, pague menos.",
    "🎁 Frete grátis garantido em pedidos a partir de R$149 só hoje.",
    "🎉 Pedidos acima de R$350 levam frete + um presente surpresa da MOB.",
    "⚡ Hoje tem frete grátis em compras acima de R$250 — só até as 18h.",
    "🔥 Acima de R$299? Frete por nossa conta e entrega expressa!",
    "🚚 Fechou acima de R$349? MOB cuida do frete e garante entrega rápida.",
    "💼 Clientes MOB sempre têm vantagem — acima de R$200, o frete é grátis!",
  ];

  const localizacoes = [
    "📍 Estamos em Fortaleza, Recife e São Paulo, com entrega garantida pra todo o Brasil.",
    "🚚 Estoques em SP, PE e CE — seu pedido chega com rapidez, onde estiver.",
    "🗺️ Unidades em São Paulo, Recife e Fortaleza — cobertura nacional total.",
    "🧭 Enviamos de capitais direto pro seu estúdio — com logística segura e rápida.",
    "🌎 Base em SP, PE e CE — sua entrega garantida em qualquer região do Brasil.",
  ];

  const curiosidades = [
    "Dica técnica: agulhas 0805 são ideais para traços finos e delicados em áreas sensíveis.",
    "Cartuchos bem calibrados reduzem em até 30% o trauma na pele durante a sessão.",
    "A voltagem correta aumenta a durabilidade da sua máquina e preserva o cartucho.",
    "Para sombras suaves, prefira cartuchos MGR com voltagem média e movimentos circulares.",
    "O ângulo da agulha interfere diretamente na fixação e intensidade da tinta.",
    "Linhas precisas começam com uma voltagem estável e punho leve.",
    "Dica prática: troque o cartucho a cada 3 sessões para manter o padrão de qualidade.",
    "Você sabia que as primeiras tatuagens conhecidas têm mais de 5 mil anos?",
    "O blackwork é uma das técnicas mais antigas ainda usadas por tatuadores modernos.",
    "Durante guerras, tatuadores improvisavam máquinas com motores de toca-fitas.",
    "A tatuagem já foi símbolo de status e proteção espiritual em várias culturas antigas.",
    "No Japão feudal, tatuagem era privilégio — depois virou resistência silenciosa.",
    "A evolução dos cartuchos mudou a tatuagem moderna: mais segurança e fluidez no traço.",
    "No Egito Antigo, tatuagens marcavam rituais espirituais femininos com significado profundo.",
    "Você sabia que usar vaselina sólida ajuda a manter o stencil fixo durante toda a sessão?",
    "Cartuchos estéreis são de uso único — obrigatórios por lei e pela segurança do cliente.",
    "Tatuagens coloridas demoram mais a cicatrizar — é normal, só exige mais cuidado.",
    "Clientes sempre perguntam: dói mais onde? Ossos e regiões com pouca gordura, com certeza.",
    "Por que agulhas maiores doem mais? A área de impacto é maior e exige controle.",
    "Quer evitar falhas? Ajuste a voltagem conforme o tipo de traço — contorno ou sombra.",
    "Higiene correta no pós-tatuagem acelera a cicatrização em até 30%. Indique sempre ao cliente!",
    "Você sabia que estudar anatomia ajuda a entender o movimento da pele e melhorar o traço?",
    "Você sabia que o estilo sketch simula rascunhos com linhas duplas intencionais?",
    "Você sabia que agulhas curvas facilitam o sombreamento suave e uniforme?",
    "Você sabia que máquinas rotativas oferecem constância ideal para traços longos?",
    "Você sabia que lápis dermográficos ajudam a definir a base do desenho antes do stencil?",
    "Você sabia que cartuchos de qualidade reduzem o tempo da sessão e o desgaste do equipamento?",
    "Você sabia que biossegurança faz parte da sua marca como profissional? Cliente repara nisso.",
  ];

  const diaSemana = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
  const diaSemanaCapitalizada = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  const saudacoesDoDia = [
    `📅 ${diaSemanaCapitalizada} chegou com novidade: frete grátis e estoque completo na MOB!`,
    `📅 ${diaSemanaCapitalizada} tá ideal pra reforçar o estoque — aproveite as ofertas da MOB!`,
    `📅 ${diaSemanaCapitalizada} é dia de agilizar os pedidos e garantir os cartuchos que mais giram.`,
    `📅 ${diaSemanaCapitalizada} começou com reposição nova aqui na MOB — corre pra aproveitar!`,
    `📅 ${diaSemanaCapitalizada} tá pedindo traço novo: já conferiu os destaques de hoje?`,
    `📅 ${diaSemanaCapitalizada} é o momento certo pra renovar o que mais sai no seu estúdio.`,
  ];

  const saudacaoDoDia = r(saudacoesDoDia);

  const encerramento = "💪 Conte com a MOB Supply pra fortalecer seu estúdio!\n📲 instagram.com/mob.supplybr";

  return [
    r(saudacoes),
    "",
    saudacaoDoDia,
    "",
    r(mensagensProdutos),
    "",
    r(ofertas),
    "",
    r(localizacoes),
    "",
    `💡 ${r(curiosidades)}`,
    "",
    encerramento
  ].join("\n");
};